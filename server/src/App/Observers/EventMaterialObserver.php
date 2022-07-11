<?php
declare(strict_types=1);

namespace Robert2\API\Observers;

use Illuminate\Database\Eloquent\Builder;
use Robert2\API\Models\Event;
use Robert2\API\Models\EventMaterial;

final class EventMaterialObserver
{
    public function saved(EventMaterial $eventMaterial)
    {
        $this->_handle($eventMaterial);
    }

    public function deleting(EventMaterial $eventMaterial)
    {
        $this->_handle($eventMaterial);
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    private function _handle(EventMaterial $eventMaterial)
    {
        /** @var Robert2\API\Models\Event */
        $event = $eventMaterial->event;

        /** @var Robert2\API\Models\Material */
        $material = $eventMaterial->material;

        // - Edge case: L'event n'est pas complet => On invalide tout le cache event.
        if (!$event || !$material) {
            // phpcs:ignore Generic.Files.LineLength
            debug("[Event] Le matériel d'un événement a été modifié mais il n'a pas été possible de récupérer les modèles liés.");
            debug($eventMaterial->getAttributes());
            container('cache')->invalidateTags([Event::getModelCacheKey()]);
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
        // - On invalide le cache des autres événements ayant le matériel lié parmis leurs "dépendances".
        //

        /** @var Robert2\API\Models\Event[] */
        $events = $material->Events()
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
