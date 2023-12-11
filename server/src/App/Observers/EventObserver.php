<?php
declare(strict_types=1);

namespace Loxya\Observers;

use Loxya\Models\Event;
use Loxya\Models\EventMaterial;

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
        //   d'être modifié lors de la modification de la date de début / fin d'événement.
        //   (anciens voisins ou nouveau, peu importe)
        //

        if (!$event->wasChanged(['start_date', 'end_date'])) {
            return;
        }
        $oldData = $event->getOriginal();

        //
        // -- Événements ...
        //

        $newNeighborEvents = Event::inPeriod($event)->get();
        $oldNeighborEvents = Event::query()
            ->inPeriod(
                $oldData['start_date'],
                $oldData['end_date']
            )
            ->get();

        $neighborEvents = $oldNeighborEvents->merge($newNeighborEvents)
            ->unique('id')
            ->values();

        foreach ($neighborEvents as $neighborEvent) {
            $neighborEvent->invalidateCache('has_missing_materials');
        }
    }

    private function onUpdateSyncDepartureInventories(Event $event): void
    {
        // - Si les dates de l'événement n'ont pas changées, on ne va pas plus loin.
        if (!$event->wasChanged(['start_date', 'end_date'])) {
            return;
        }

        // - Si la période d'inventaire est "ouverte", on laisse passer.
        if ($event->is_departure_inventory_period_open) {
            return;
        }

        // - Si la période d'inventaire n'est pas ouverte, on supprime l'inventaire de départ.
        dbTransaction(function () use ($event) {
            $event->is_departure_inventory_done = false;
            $event->departure_inventory_author_id = null;
            $event->departure_inventory_datetime = null;
            $event->saveQuietly();
            $event->refresh();

            foreach ($event->materials as $material) {
                /** @var EventMaterial $eventMaterial */
                $eventMaterial = $material->pivot;
                $eventMaterial->quantity_departed = null;
                $eventMaterial->departure_comment = null;
                $eventMaterial->save();
            }
        });
    }

    private function onUpdateSyncReturnInventories(Event $event): void
    {
        // - Si les dates de l'événement n'ont pas changées, on ne va pas plus loin.
        if (!$event->wasChanged(['start_date', 'end_date'])) {
            return;
        }

        // FIXME: Cette condition devra être modifiée lorsque les dates
        //        de mobilisation auront été implémentées.
        // - L'inventaire de retour ne peut pas être marqué comme terminé
        //   avant le jour de fin de l'événement.
        $canBeTerminated = (
            $event->getEndDate()->isPast() ||
            $event->getEndDate()->isSameDay()
        );
        if (!$canBeTerminated) {
            $event->is_return_inventory_done = false;
            $event->return_inventory_author_id = null;
            $event->return_inventory_datetime = null;
            $event->saveQuietly();
            $event->refresh();
        }

        // - Si la période d'inventaire est "ouverte", on laisse passer.
        if ($event->is_return_inventory_period_open) {
            return;
        }

        // - Sinon, on reset les quantités d'inventaire.
        dbTransaction(function () use ($event) {
            foreach ($event->materials()->get() as $material) {
                /** @var EventMaterial $eventMaterial */
                $eventMaterial = $material->pivot;
                $eventMaterial->quantity_returned = null;
                $eventMaterial->quantity_returned_broken = null;
                $eventMaterial->save();
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
