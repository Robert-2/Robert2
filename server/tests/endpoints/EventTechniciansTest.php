<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Collection;
use Robert2\API\Models\EventTechnician;
use Robert2\Support\Arr;

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
                'event' => [
                    'id' => 1,
                    'title' => 'Premier événement',
                    'start_date' => '2018-12-17 00:00:00',
                    'end_date' => '2018-12-18 23:59:59',
                    'description' => null,
                    'location' => 'Gap',
                    'reference' => null,
                    'user_id' => 1,
                    'is_archived' => false,
                    'is_billable' => true,
                    'is_confirmed' => false,
                    'is_return_inventory_done' => true,
                    'created_at' => '2018-12-01 12:50:45',
                    'updated_at' => '2018-12-05 08:31:21',
                ],
            ],
            [
                'id' => 2,
                'event_id' => 1,
                'technician_id' => 2,
                'start_time' => '2018-12-18 14:00:00',
                'end_time' => '2018-12-18 18:00:00',
                'position' => 'Technicien plateau',
                'technician' => TechniciansTest::data(2),
                'event' => [
                    'id' => 1,
                    'title' => 'Premier événement',
                    'start_date' => '2018-12-17 00:00:00',
                    'end_date' => '2018-12-18 23:59:59',
                    'description' => null,
                    'location' => 'Gap',
                    'reference' => null,
                    'user_id' => 1,
                    'is_archived' => false,
                    'is_billable' => true,
                    'is_confirmed' => false,
                    'is_return_inventory_done' => true,
                    'created_at' => '2018-12-01 12:50:45',
                    'updated_at' => '2018-12-05 08:31:21',
                ],
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
            'id' => 3,
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
