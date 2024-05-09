<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Carbon;
use Loxya\Models\Event;
use Loxya\Support\Arr;

final class BookingsTest extends ApiTestCase
{
    public function testGetAll(): void
    {
        static::setCustomConfig(['maxItemsPerPage' => 5]);

        // - Test sans pagination, avec une période.
        $this->client->get('/api/bookings?paginated=0&period[start]=2018-12-01&period[end]=2018-12-31');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            EventsTest::data(3, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(1, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(2, Event::SERIALIZE_BOOKING_EXCERPT),
        ]);

        // - Test sans pagination, et sans passer de période.
        $this->client->get('/api/bookings?paginated=0');
        $this->assertStatusCode(StatusCode::STATUS_NOT_ACCEPTABLE);

        // - Test sans pagination, avec un trop grand intervalle.
        $this->client->get('/api/bookings?paginated=0&period[start]=2018-01-01&period[end]=2018-12-31');
        $this->assertStatusCode(StatusCode::STATUS_RANGE_NOT_SATISFIABLE);

        // - Test simple avec pagination (page 1).
        $this->client->get('/api/bookings?paginated=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(6, [
            EventsTest::data(7, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(5, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(6, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(4, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(2, Event::SERIALIZE_BOOKING_EXCERPT),
        ]);

        // - Test simple avec pagination (page 2).
        $this->client->get('/api/bookings?paginated=1&page=2');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(6, [
            EventsTest::data(1, Event::SERIALIZE_BOOKING_EXCERPT),
        ]);

        // - Test avec un terme de recherche (titre, lieu ou bénéficiaire).
        $this->client->get('/api/bookings?paginated=1&search=test');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(2, [
            EventsTest::data(5, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(1, Event::SERIALIZE_BOOKING_EXCERPT),
        ]);

        // - Test avec un filtre sur le parc "spare".
        $this->client->get('/api/bookings?paginated=1&park=2');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(2, [
            EventsTest::data(7, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(4, Event::SERIALIZE_BOOKING_EXCERPT),
        ]);

        // - Test avec un filtre sur la catégorie "Décors".
        $this->client->get('/api/bookings?paginated=1&category=4');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            EventsTest::data(5, Event::SERIALIZE_BOOKING_EXCERPT),
        ]);

        // - Test avec un filtre sur les bookings archivés.
        $this->client->get('/api/bookings?paginated=1&archived=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            EventsTest::data(3, Event::SERIALIZE_BOOKING_EXCERPT),
        ]);

        // - Test avec un filtre sur les bookings dont l'inventaire de retour reste à faire.
        $this->client->get('/api/bookings?paginated=1&returnInventoryTodo=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(4, [
            EventsTest::data(7, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(5, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(6, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(4, Event::SERIALIZE_BOOKING_EXCERPT),
        ]);

        // - Test avec un filtre sur les événements non-confirmés.
        $this->client->get('/api/bookings?paginated=1&notConfirmed=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(5, [
            EventsTest::data(5, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(6, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(4, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(2, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(1, Event::SERIALIZE_BOOKING_EXCERPT),
        ]);

        // - Test avec un filtre sur les bookings non-confirmés ET dont
        //   l'inventaire de retour reste à faire.
        $this->client->get('/api/bookings?paginated=1&notConfirmed=1&returnInventoryTodo=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(3, [
            EventsTest::data(5, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(6, Event::SERIALIZE_BOOKING_EXCERPT),
            EventsTest::data(4, Event::SERIALIZE_BOOKING_EXCERPT),
        ]);

        // - Test avec un filtre sur les bookings se terminant aujourd'hui.
        Carbon::setTestNow(Carbon::create(2023, 5, 28, 18, 0, 0));

        $this->client->get('/api/bookings?paginated=1&endingToday=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            EventsTest::data(7, Event::SERIALIZE_BOOKING_EXCERPT),
        ]);
    }

    public function testGetOneSummary(): void
    {
        // - Événements.
        $ids = array_column(EventsTest::data(null), 'id');
        foreach ($ids as $id) {
            $this->client->get(sprintf('/api/bookings/%s/%d/summary', Event::TYPE, $id));
            $this->assertStatusCode(StatusCode::STATUS_OK);
            $this->assertResponseData(EventsTest::data($id, Event::SERIALIZE_BOOKING_SUMMARY));
        }
    }

    public function testUpdateEventMaterialsInvalid(): void
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

    public function testUpdateEventMaterials(): void
    {
        Carbon::setTestNow(Carbon::create(2019, 3, 15, 18, 0, 0));

        // - Modification d'un événement qui n'est pas encore passé.
        $this->client->put(sprintf('/api/bookings/%s/4/materials', Event::TYPE), [
            ['id' => 1, 'quantity' => 2],
            ['id' => 6, 'quantity' => 2],
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $eventData = EventsTest::data(4, Event::SERIALIZE_BOOKING_DEFAULT);
        $this->assertResponseData(array_replace($eventData, [
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
    }
}
