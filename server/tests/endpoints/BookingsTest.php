<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Carbon;
use Loxya\Models\Event;
use Loxya\Support\Arr;

final class BookingsTest extends ApiTestCase
{
    public function testGetAll()
    {
        // - Test simple.
        $this->client->get('/api/bookings?start=2018-12-01&end=2018-12-31');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            array_replace(
                EventsTest::data(3, Event::SERIALIZE_BOOKING_SUMMARY),
                ['entity' => 'event'],
            ),
            array_replace(
                EventsTest::data(1, Event::SERIALIZE_BOOKING_SUMMARY),
                ['entity' => 'event'],
            ),
            array_replace(
                EventsTest::data(2, Event::SERIALIZE_BOOKING_SUMMARY),
                ['entity' => 'event'],
            ),
        ]);

        // - Test avec un trop grand intervalle.
        $this->client->get('/api/bookings?start=2018-01-01&end=2018-12-31');
        $this->assertStatusCode(StatusCode::STATUS_RANGE_NOT_SATISFIABLE);
    }

    public function testUpdateEventMaterialsInvalid()
    {
        Carbon::setTestNow(Carbon::create(2023, 5, 3, 18, 0, 0));

        // - Confirmation de l'événement #1 avant le test.
        $event = Event::findOrFail(1);
        $event->is_confirmed = true;
        $event->save();

        // - Un événement inexistant n'est pas modifiable.
        $this->client->put(sprintf('/api/bookings/%s/999/materials', Event::TYPE), []);
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Un événement confirmé qui est passé n'est pas modifiable.
        $this->client->put(sprintf('/api/bookings/%s/1/materials', Event::TYPE), []);
        $this->assertStatusCode(StatusCode::STATUS_UNPROCESSABLE_ENTITY);
    }

    public function testUpdateEventMaterials()
    {
        Carbon::setTestNow(Carbon::create(2019, 3, 15, 18, 0, 0));

        // - Modification d'un événement qui n'est pas encore passé.
        $this->client->put(sprintf('/api/bookings/%s/4/materials', Event::TYPE), [
            ['id' => 1, 'quantity' => 2],
            ['id' => 6, 'quantity' => 2],
        ]);
        $eventData = EventsTest::data(4, Event::SERIALIZE_BOOKING_DEFAULT);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace($eventData, [
            'entity' => Event::TYPE,
            'has_missing_materials' => false,
            'total_replacement' => '39638.00',
            'materials' => array_replace_recursive(
                Arr::except($eventData['materials'], 2),
                [
                    ['pivot' => [
                        'quantity' => 2,
                    ]],
                    ['pivot' => [
                        'quantity' => 2,
                        'quantity_returned' => 1,
                        'quantity_returned_broken' => 0,
                    ]],
                ],
            ),
        ]));

        Carbon::setTestNow(Carbon::create(2023, 5, 26, 18, 0, 0));
    }
}
