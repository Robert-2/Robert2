<?php
declare(strict_types=1);

namespace Robert2\API\Observers;

use Robert2\API\Models\Material;

final class MaterialObserver
{
    public function updated(Material $material)
    {
        debug("[Event] Matériel #%s mis à jour.", $material->id);

        if (!$material->wasChanged(['stock_quantity', 'out_of_order_quantity'])) {
            debug('-> Pas de changement dans les quantités.');
            return;
        }

        /** @var Robert2\API\Models\Event $event */
        foreach ($material->events as $event) {
            $event->invalidateCache('has_missing_materials');
        }
    }

    public function restored(Material $material)
    {
        debug("[Event] Matériel #%s restauré.", $material->id);

        /** @var Robert2\API\Models\Event $event */
        foreach ($material->events as $event) {
            $event->invalidateCache([
                'has_missing_materials',
                'has_not_returned_materials',
            ]);
        }
    }

    public function deleting(Material $material)
    {
        if ($material->isForceDeleting()) {
            debug("[Event] Matériel #%s supprimé définitivement.", $material->id);
        } else {
            debug("[Event] Matériel #%s supprimé.", $material->id);
        }

        /** @var Robert2\API\Models\Event $event */
        foreach ($material->events as $event) {
            $event->invalidateCache([
                'has_missing_materials',
                'has_not_returned_materials',
            ]);
        }
    }
}
