<?php
declare(strict_types=1);

namespace Loxya\Observers;

use Loxya\Models\Event;

final class EventObserver
{
    public $afterCommit = true;

    public function created(Event $event)
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

    public function updated(Event $event)
    {
        debug("[Event] Événement #%s modifié.", $event->id);

        $this->onUpdateSyncCache($event);
    }

    public function restored(Event $event)
    {
        debug("[Event] Événement #%s restauré.", $event->id);

        $this->onRestoreSyncCache($event);
    }

    public function deleting(Event $event)
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

    public function deleted(Event $event)
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
