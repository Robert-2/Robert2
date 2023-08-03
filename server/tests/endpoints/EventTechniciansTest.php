<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Collection;
use Loxya\Models\EventTechnician;
use Loxya\Support\Arr;

final class EventTechniciansTest extends ApiTestCase
{
    public static function data(int $id, string $format = EventTechnician::SERIALIZE_DEFAULT)
    {
        $eventTechnicians = new Collection([
            [
                'id' => 1,
                'event_id' => 1,
                'technician_id' => 1,
                'start_time' => '2018-12-17 09:00:00',
                'end_time' => '2018-12-18 22:00:00',
                'position' => 'Régisseur',
                'technician' => TechniciansTest::data(1),
                'event' => EventsTest::data(1),
            ],
            [
                'id' => 2,
                'event_id' => 1,
                'technician_id' => 2,
                'start_time' => '2018-12-18 14:00:00',
                'end_time' => '2018-12-18 18:00:00',
                'position' => 'Technicien plateau',
                'technician' => TechniciansTest::data(2),
                'event' => EventsTest::data(1),
            ],
        ]);

        $eventTechnicians = match ($format) {
            EventTechnician::SERIALIZE_DEFAULT => $eventTechnicians->map(fn($event) => (
                Arr::except($event, ['event'])
            )),
            EventTechnician::SERIALIZE_DETAILS => $eventTechnicians,
            default => throw new \InvalidArgumentException(sprintf("Unknown format \"%s\"", $format)),
        };

        return static::_dataFactory($id, $eventTechnicians->all());
    }

    public function testGetOneEventTechnician()
    {
        $this->client->get('/api/event-technicians/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1));
    }

    public function testCreateEventTechnician()
    {
        $data = [
            'event_id' => 1,
            'technician_id' => 2,
            'start_time' => '2018-12-17 10:00:00',
            'end_time' => '2018-12-17 20:30:00',
            'position' => 'Testeur',
        ];
        $this->client->post('/api/event-technicians', $data);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 4,
            'event_id' => 1,
            'technician_id' => 2,
            'start_time' => '2018-12-17 10:00:00',
            'end_time' => '2018-12-17 20:30:00',
            'position' => 'Testeur',
            'technician' => TechniciansTest::data(2),
        ]);
    }

    public function testUpdateEventTechnicianNoData()
    {
        $this->client->put('/api/event-technicians/1', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testUpdateEventTechnician()
    {
        $data = [
            'start_time' => '2018-12-17 10:00:00',
            'end_time' => '2018-12-18 20:00:00',
            'position' => 'Régisseur général',
        ];
        $this->client->put('/api/event-technicians/1', $data);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace(self::data(1), [
            'start_time' => '2018-12-17 10:00:00',
            'end_time' => '2018-12-18 20:00:00',
            'position' => 'Régisseur général',
        ]));
    }

    public function testDestroyEventTechnician()
    {
        $this->client->delete('/api/event-technicians/2');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
    }
}
