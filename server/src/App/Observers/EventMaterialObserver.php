<?php
declare(strict_types=1);

namespace Loxya\Observers;

use Illuminate\Database\Eloquent\Builder;
use Loxya\Models\Event;
use Loxya\Models\EventMaterial;

final class EventMaterialObserver
{
    public $afterCommit = true;

    public function created(EventMaterial $eventMaterial)
    {
        $this->syncCache($eventMaterial);
    }

    public function updated(EventMaterial $eventMaterial)
    {
        $this->syncCache($eventMaterial);
    }

    public function deleting(EventMaterial $eventMaterial)
    {
        $this->syncCache($eventMaterial);
    }

    // ------------------------------------------------------
    // -
    // -    Event sub-processing
    // -
    // ------------------------------------------------------

    private function syncCache(EventMaterial $eventMaterial): void
    {
        $event = $eventMaterial->event;
        $material = $eventMaterial->material;

        // - Edge case: L'event n'est pas complet => On invalide tout le cache des bookables.
        if (!$event || !$material) {
            // phpcs:ignore Generic.Files.LineLength
            debug("[Event] Le matériel d'un événement a été modifié mais il n'a pas été possible de récupérer les modèles liés.");
            debug($eventMaterial->getAttributes());
            container('cache')->invalidateTags([
                Event::getModelCacheKey(),
            ]);
            return;
        }

        debug("[Event] Du matériel de l'événement #%s a été modifié.", $event->id);

        //
        // - On invalide le cache dépendant de la liste de matériel dans l'événement lié.
        //

        $event->invalidateCache([
            'has_missing_materials',
            'has_not_returned_materials',
        ]);

        //
        // - On invalide le cache des autres bookables ayant le matériel lié parmi leurs "dépendances".
        //

        //
        // -- Événements ...
        //

        /** @var \Loxya\Models\Event[] $events */
        $events = $material->events()
            ->where($event->qualifyColumn('id'), '<>', $event->id)
            ->where(function (Builder $query) use ($event) {
                $query->where([
                    ['end_date', '>=', $event->start_date],
                    ['start_date', '<=', $event->end_date],
                ]);
            })
            ->get();

        foreach ($events as $event) {
            $event->invalidateCache('has_missing_materials');
        }
    }
}
