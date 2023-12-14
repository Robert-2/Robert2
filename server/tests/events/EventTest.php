<?php
declare(strict_types=1);

namespace Loxya\Tests\Events;

use Illuminate\Support\Carbon;
use Loxya\Models\Estimate;
use Loxya\Models\Event;
use Loxya\Models\EventMaterial;
use Loxya\Models\Invoice;
use Loxya\Tests\TestCase;

final class EventTest extends TestCase
{
    public function testDeleteEventAlsoRemoveInvoices(): void
    {
        Event::findOrFail(1)->delete();

        // - Si l'événement est supprimé, ses factures et devis doivent l'être aussi.
        //   (ceci est géré "manuellement" car ce sont des entités polymorphes)
        $this->assertNull(Invoice::find(1));
        $this->assertNull(Estimate::find(1));
    }

    public function testChangeDateResetDepartureInventory(): void
    {
        Carbon::setTestNow(Carbon::create(2023, 11, 18, 21, 11, 22));

        $event = Event::findOrFail(1);
        $setEventDate = function ($start, $end) use (&$event) {
            $event->start_date = $start;
            $event->end_date = $end;
            $event->save();
            $event->refresh();
        };

        // - Si l'événement est mis à une autre date passée ...
        //   => Pas de changement (l'inventaire est laissé comme "effectué")
        $setEventDate('2020-11-17 00:00:00', '2020-11-18 23:59:59');
        $this->assertTrue($event->is_departure_inventory_done);
        foreach ($event->materials as $material) {
            /** @var EventMaterial $eventMaterial */
            $eventMaterial = $material->pivot;

            $this->assertNotNull($eventMaterial->quantity_departed);
        }

        // - Si l'événement est mis à une date future mais ou l'inventaire
        //   est déjà possible (- 24 avant le début de l'événement)...
        //   => Pas de changement (l'inventaire est laissé comme "effectué")
        $setEventDate('2023-11-19 00:00:00', '2023-11-20 23:59:59');
        $this->assertTrue($event->is_departure_inventory_done);
        foreach ($event->materials as $material) {
            /** @var EventMaterial $eventMaterial */
            $eventMaterial = $material->pivot;

            $this->assertNotNull($eventMaterial->quantity_departed);
        }

        // - Si l'événement est mis à une date future, pour laquelle l'inventaire
        //   ne serait pas possible sinon, on reset l'inventaire.
        $setEventDate('2023-11-20 00:00:00', '2023-11-21 23:59:59');
        $this->assertFalse($event->is_departure_inventory_done);
        foreach ($event->materials as $material) {
            /** @var EventMaterial $eventMaterial */
            $eventMaterial = $material->pivot;

            $this->assertNull($eventMaterial->quantity_departed);
            $this->assertNull($eventMaterial->departure_comment);
        }
    }

    public function testChangeDateResetReturnInventory(): void
    {
        Carbon::setTestNow(Carbon::create(2023, 11, 18, 21, 11, 22));

        $event = Event::findOrFail(1);
        $setEventDate = function ($start, $end) use (&$event) {
            $event->start_date = $start;
            $event->end_date = $end;
            $event->save();
            $event->refresh();
        };

        // - Si l'événement est mis à une autre date passée ...
        //   => Pas de changement (l'inventaire est laissé comme "effectué")
        $setEventDate('2020-11-17 00:00:00', '2020-11-18 23:59:59');
        $this->assertTrue($event->is_return_inventory_done);
        foreach ($event->materials as $material) {
            /** @var EventMaterial $eventMaterial */
            $eventMaterial = $material->pivot;

            $this->assertNotNull($eventMaterial->quantity_returned);
            $this->assertNotNull($eventMaterial->quantity_returned_broken);
        }

        // - Si l'événement est mis à une date future pour laquelle
        //   l'inventaire est possible mais ne peut pas être terminé ...
        //   => On reset le statut `done` mais on laisse l'inventaire.
        $setEventDate('2023-11-17 00:00:00', '2023-11-20 23:59:59');
        $this->assertFalse($event->is_return_inventory_done);
        foreach ($event->materials as $material) {
            /** @var EventMaterial $eventMaterial */
            $eventMaterial = $material->pivot;

            $this->assertNotNull($eventMaterial->quantity_returned);
            $this->assertNotNull($eventMaterial->quantity_returned_broken);
        }

        // - Si l'événement est mis à une date future pour laquelle l'inventaire
        //   ne serait pas possible sinon, on reset l'inventaire.
        $setEventDate('2023-11-20 00:00:00', '2023-11-21 23:59:59');
        $this->assertFalse($event->is_return_inventory_done);
        foreach ($event->materials as $material) {
            /** @var EventMaterial $eventMaterial */
            $eventMaterial = $material->pivot;

            $this->assertNull($eventMaterial->quantity_returned);
            $this->assertNull($eventMaterial->quantity_returned_broken);
        }
    }
}
