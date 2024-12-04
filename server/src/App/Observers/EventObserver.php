<?php
declare(strict_types=1);

namespace Loxya\Observers;

use Brick\Math\BigDecimal as Decimal;
use Loxya\Models\Event;

final class EventObserver
{
    public $afterCommit = true;

    public function created(Event $event): void
    {
        debug("[Event] Événement #%s ajouté.", $event->id);

        //
        // - Dans le doute, on supprime le cache de l'événement lors de sa création.
        //

        $event->invalidateCache();

        //
        // - On invalide le cache du matériel manquant des bookables voisins à celui qui vient d'être créé.
        //

        //
        // -- Événements ...
        //

        $neighborEvents = Event::inPeriod($event)->get();
        foreach ($neighborEvents as $neighborEvent) {
            $neighborEvent->invalidateCache('has_missing_materials');
        }
    }

    public function updated(Event $event): void
    {
        debug("[Event] Événement #%s modifié.", $event->id);

        $this->onUpdateSyncCache($event);
        $this->onUpdateSyncEventMaterials($event);
        $this->onUpdateSyncDepartureInventories($event);
        $this->onUpdateSyncReturnInventories($event);
    }

    public function restored(Event $event): void
    {
        debug("[Event] Événement #%s restauré.", $event->id);

        $this->onRestoreSyncCache($event);
    }

    public function deleting(Event $event): void
    {
        if ($event->isForceDeleting()) {
            debug("[Event] Événement #%s supprimé définitivement.", $event->id);
        } else {
            debug("[Event] Événement #%s supprimé.", $event->id);
        }

        //
        // - On invalide le cache de l'événement "soft-delete".
        //   (pour éviter une reprise de cache malheureuse lors d'un éventuel rétablissement)
        //

        $event->invalidateCache();

        //
        // - On invalide le cache du matériel manquant des bookables voisins à celui-ci.
        //

        //
        // -- Événements ...
        //

        $neighborEvents = Event::inPeriod($event)->get();
        foreach ($neighborEvents as $neighborEvent) {
            $neighborEvent->invalidateCache('has_missing_materials');
        }
    }

    public function deleted(Event $event): void
    {
        if (!$event->isForceDeleting()) {
            return;
        }

        //
        // - Supprime les factures et devis liés.
        //   (Doit être géré manuellement car tables polymorphes)
        //

        $event->invoices->each->delete();
        $event->estimates->each->delete();
    }

    // ------------------------------------------------------
    // -
    // -    Event sub-processing
    // -
    // ------------------------------------------------------

    private function onUpdateSyncCache(Event $event): void
    {
        //
        // - On invalide le cache du présent événement.
        //

        $event->invalidateCache();

        //
        // - On invalide le cache du matériel manquant des bookables voisins à celui qui vient
        //   d'être modifié lors de la modification de la période de mobilisation de l'événement.
        //   (anciens voisins ou nouveau, peu importe).
        //

        if (!$event->wasChanged(['mobilization_start_date', 'mobilization_end_date'])) {
            return;
        }
        $oldData = $event->getPrevious();

        //
        // -- Événements ...
        //

        $newNeighborEvents = Event::inPeriod($event)->get();
        $oldNeighborEvents = Event::query()
            ->inPeriod(
                $oldData['mobilization_start_date'],
                $oldData['mobilization_end_date'],
            )
            ->get();

        $neighborEvents = $oldNeighborEvents->merge($newNeighborEvents)
            ->unique('id')
            ->values();

        foreach ($neighborEvents as $neighborEvent) {
            $neighborEvent->invalidateCache('has_missing_materials');
        }
    }

    private function onUpdateSyncEventMaterials(Event $event): void
    {
        // - Si la facturabilité ou la période d'opération de l'événement n'ont pas changés, on ne va pas plus loin.
        $hasChangedIsBillable = $event->wasChanged(['is_billable']);
        $hasChangedOperationPeriod = $event->wasChanged(['operation_start_date', 'operation_end_date']);
        if (!$hasChangedOperationPeriod && !$hasChangedIsBillable) {
            return;
        }

        dbTransaction(static function () use ($event, $hasChangedOperationPeriod, $hasChangedIsBillable) {
            foreach ($event->materials as $eventMaterial) {
                $material = $eventMaterial->material;

                if ($hasChangedIsBillable) {
                    $eventMaterial->unit_price = !$event->is_billable ? null : (
                        $material->rental_price ?? Decimal::zero()
                    );
                    $eventMaterial->discount_rate = !$event->is_billable ? null : (
                        Decimal::zero()
                    );
                    $eventMaterial->taxes = !$event->is_billable ? null : (
                        $material->tax?->asFlatArray()
                    );
                }

                if ($hasChangedIsBillable || $hasChangedOperationPeriod) {
                    $durationDays = $event->operation_period->asDays();
                    $eventMaterial->degressive_rate = !$event->is_billable ? null : (
                        $material->degressive_rate?->computeForDays($durationDays)
                            // - Pas de dégressivité.
                            ?? $durationDays
                    );
                }

                $eventMaterial->save(['validate' => false]);
            }

            if ($hasChangedIsBillable && !$event->is_billable) {
                $event->extras->each->delete();
            }
        });
    }

    private function onUpdateSyncDepartureInventories(Event $event): void
    {
        // - Si les dates de l'événement n'ont pas changées, on ne va pas plus loin.
        $dateFields = [
            'operation_start_date',
            'operation_end_date',
            'mobilization_start_date',
            'mobilization_end_date',
        ];
        if (!$event->wasChanged($dateFields)) {
            return;
        }

        // - Si la période d'inventaire est "ouverte", on laisse passer.
        if ($event->is_departure_inventory_period_open) {
            return;
        }

        // - Si la période d'inventaire départ n'est pas ouverte, on supprime l'inventaire.
        dbTransaction(static function () use ($event) {
            $event->is_departure_inventory_done = false;
            $event->departure_inventory_author_id = null;
            $event->departure_inventory_datetime = null;
            $event->saveQuietly(['validate' => false]);
            $event->refresh();

            foreach ($event->materials as $eventMaterial) {
                $eventMaterial->quantity_departed = null;
                $eventMaterial->departure_comment = null;
                $eventMaterial->save(['validate' => false]);
            }
        });
    }

    private function onUpdateSyncReturnInventories(Event $event): void
    {
        // - Si les dates  de l'événement n'ont pas changées, on ne va pas plus loin.
        $dateFields = [
            'operation_start_date',
            'operation_end_date',
            'mobilization_start_date',
            'mobilization_end_date',
        ];
        if (!$event->wasChanged($dateFields)) {
            return;
        }

        // - Si la période d'inventaire est "ouverte", on laisse passer.
        if ($event->is_return_inventory_period_open) {
            return;
        }

        // - Si la période d'inventaire de retour n'est pas ouverte, on supprime l'inventaire.
        dbTransaction(static function () use ($event) {
            $event->is_archived = false;
            $event->is_return_inventory_done = false;
            $event->return_inventory_author_id = null;
            $event->return_inventory_datetime = null;
            $event->saveQuietly(['validate' => false]);
            $event->refresh();

            foreach ($event->materials as $eventMaterial) {
                $eventMaterial->quantity_returned = null;
                $eventMaterial->quantity_returned_broken = null;
                $eventMaterial->save(['validate' => false]);
            }
        });
    }

    private function onRestoreSyncCache(Event $event): void
    {
        //
        // - Dans le doute, on supprime le cache de l'événement lors de son rétablissement.
        //

        $event->invalidateCache();

        //
        // - On invalide le cache du matériel manquant des bookables voisins à celui
        //   qui vient d'être restauré.
        //

        //
        // -- Événements ...
        //

        $neighborEvents = Event::inPeriod($event)->get();
        foreach ($neighborEvents as $neighborEvent) {
            $neighborEvent->invalidateCache('has_missing_materials');
        }
    }
}
