<?php
declare(strict_types=1);

namespace Robert2\API\Observers;

use Robert2\API\Models\Event;

class EventObserver
{
    public function created(Event $event)
    {
        //
        // - Dans le doute, on supprime le cache de l'événement lors de sa création.
        //

        $event->invalidateCache();

        //
        // - On invalide le cache du matériel manquant des événéments voisins à celui qui vient d'être créé.
        //

        /** @var Event[] */
        $neighborEvents = Event::inPeriod($event->start_date, $event->end_date)->get();
        foreach ($neighborEvents as $neighborEvent) {
            // TODO: N'invalider que si pour les events avec du matériel en commun ?
            $neighborEvent->invalidateCache('has_missing_materials');
        }
    }

    public function updated(Event $event)
    {
        //
        // - On invalide le cache du présent événement.
        //

        $event->invalidateCache();

        //
        // - On invalide le cache du matériel manquant des événéments voisins à celui qui vient
        //   d'être modifié lors de la modification de la date de début / fin d'événement d'événement.
        //   (anciens voisins ou nouveau, peu importe)
        //

        if (!$event->wasChanged(['start_date', 'end_date'])) {
            return;
        }
        $oldData = $event->getOriginal();

        $oldNeighborEvents = Event::inPeriod($oldData['start_date'], $oldData['end_date'])->get();
        $newNeighborEvents = Event::inPeriod($event->start_date, $event->end_date)->get();

        /** @var Event[] */
        $neighborEvents = $oldNeighborEvents->merge($newNeighborEvents)
            ->unique('id')
            ->values();

        foreach ($neighborEvents as $neighborEvent) {
            // TODO: N'invalider que si pour les events avec du matériel en commun ?
            $neighborEvent->invalidateCache('has_missing_materials');
        }
    }

    public function restored(Event $event)
    {
        //
        // - Dans le doute, on supprime le cache de l'événement lors de son rétablissement.
        //

        $event->invalidateCache();

        //
        // - On invalide le cache du matériel manquant des événéments voisins à celui-ci
        //   qui vient d'être restauré.
        //

        /** @var Event[] */
        $neighborEvents = Event::inPeriod($event->start_date, $event->end_date)->get();
        foreach ($neighborEvents as $neighborEvent) {
            // TODO: N'invalider que si pour les events avec du matériel en commun ?
            $neighborEvent->invalidateCache('has_missing_materials');
        }
    }

    public function deleted(Event $event)
    {
        //
        // - On invalide le cache de l'événement "soft-delete".
        //   (pour éviter une reprise de cache malheureuse lors d'un éventuel rétablissement)
        //

        $event->invalidateCache();

        //
        // - On invalide le cache du matériel manquant des événéments voisins à celui-ci.
        //

        /** @var Event[] */
        $neighborEvents = Event::inPeriod($event->start_date, $event->end_date)->get();
        foreach ($neighborEvents as $neighborEvent) {
            // TODO: N'invalider que si pour les events avec du matériel en commun ?
            $neighborEvent->invalidateCache('has_missing_materials');
        }
    }

    public function forceDeleted(Event $event)
    {
        //
        // - On invalide le cache de l'événement supprimé.
        //

        $event->invalidateCache();

        //
        // - On invalide le cache du matériel manquant des événéments voisins à celui-ci.
        //

        // - Si l'événement était déjà "soft-deleté", on a déjà fait ce travail dans l'évent `deleted`.
        if ($event->trashed()) {
            return;
        }

        /** @var Event[] */
        $neighborEvents = Event::inPeriod($event->start_date, $event->end_date)->get();
        foreach ($neighborEvents as $neighborEvent) {
            // TODO: N'invalider que si pour les events avec du matériel en commun ?
            $neighborEvent->invalidateCache('has_missing_materials');
        }
    }
}
