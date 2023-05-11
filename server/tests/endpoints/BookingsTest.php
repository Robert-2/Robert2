<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Carbon;
use Robert2\API\Models\Event;
use Robert2\Support\Arr;

final class BookingsTest extends ApiTestCase
{
    public function testGetAll()
    {
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
    }

    public function testGetAllTooMuch()
    {
        $this->client->get('/api/bookings?start=2018-01-01&end=2018-12-31');
        $this->assertStatusCode(StatusCode::STATUS_RANGE_NOT_SATISFIABLE);
    }

    public function testUpdateEventMaterialsNotFound()
    {
        Carbon::setTestNow(Carbon::create(2023, 5, 3, 18, 0, 0));

        $entity = Event::TYPE;
        $materials = [];

        // - Confirmation de l'événement #1 avant le test
        $event = Event::findOrFail(1);
        $event->is_confirmed = true;
        $event->save();

        // - Un événement confirmé qui est passé n'est pas modifiable.
        $this->client->put('/api/bookings/1/materials', compact('entity', 'materials'));
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testUpdateEventMaterials()
    {
        Carbon::setTestNow(Carbon::create(2019, 3, 15, 18, 0, 0));

        $entity = Event::TYPE;
        $materials = [
            ['id' => 1, 'quantity' => 2],
            ['id' => 6, 'quantity' => 2],
        ];

        // - Modification d'un événement qui n'est pas encore passé.
        $this->client->put('/api/bookings/4/materials', compact('entity', 'materials'));
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $eventData = EventsTest::data(4, Event::SERIALIZE_BOOKING_DEFAULT);
        $this->assertResponseData(array_replace($eventData, [
            'entity' => Event::TYPE,
            'has_missing_materials' => true,
            'total_replacement' => '39638.00',
            'materials' => array_replace_recursive(
                Arr::except($eventData['materials'], 2),
                [
                    ['pivot' => [
                        'quantity' => 2,
                    ]],
                    ['pivot' => [
                        'quantity' => 2,
                    ]],
                ],
            ),
        ]));
    }
}
