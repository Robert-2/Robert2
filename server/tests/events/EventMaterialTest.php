<?php
declare(strict_types=1);

namespace Loxya\Tests\Events;

use Loxya\Models\Event;
use Loxya\Tests\TestCase;

final class EventMaterialTest extends TestCase
{
    public function testResetInventoriesWhenThereIsNoMaterialLeft(): void
    {
        // - On supprime tout le matériel d'un événement avec
        //   un inventaire de départ et de retour fait.
        $event = tap(Event::findOrFail(1), function ($event) {
            $event->materials()->sync([]);
            $event->refresh();
        });

        // - L'inventaire de départ doit être reset.
        $this->assertFalse($event->is_departure_inventory_done);
        $this->assertNull($event->departure_inventory_datetime);
        $this->assertNull($event->departure_inventory_author);

        // - L'inventaire de retour doit être reset.
        $this->assertFalse($event->is_return_inventory_done);
        $this->assertNull($event->return_inventory_datetime);
        $this->assertNull($event->return_inventory_author);
    }
}
