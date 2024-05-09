<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Collection;
use Loxya\Models\EventTechnician;
use Loxya\Support\Arr;

final class EventTechniciansTest extends ApiTestCase
{
    public static function data(?int $id = null, string $format = EventTechnician::SERIALIZE_FOR_EVENT)
    {
        $eventTechnicians = new Collection([
            [
                'id' => 1,
                'event_id' => 1,
                'technician_id' => 1,
                'period' => [
                    'start' => '2018-12-17 09:00:00',
                    'end' => '2018-12-18 22:00:00',
                    'isFullDays' => false,
                ],
                'position' => 'Régisseur',
                'technician' => TechniciansTest::data(1),
                'event' => EventsTest::data(1),
            ],
            [
                'id' => 2,
                'event_id' => 1,
                'technician_id' => 2,
                'period' => [
                    'start' => '2018-12-18 14:00:00',
                    'end' => '2018-12-18 18:00:00',
                    'isFullDays' => false,
                ],
                'position' => 'Technicien plateau',
                'technician' => TechniciansTest::data(2),
                'event' => EventsTest::data(1),
            ],
            [
                'id' => 3,
                'event_id' => 7,
                'technician_id' => 2,
                'period' => [
                    'start' => '2023-05-25 00:00:00',
                    'end' => '2023-05-29 00:00:00',
                    'isFullDays' => false,
                ],
                'position' => 'Ingénieur du son',
                'technician' => TechniciansTest::data(2),
                'event' => EventsTest::data(7),
            ],
        ]);

        $eventTechnicians = match ($format) {
            EventTechnician::SERIALIZE_FOR_EVENT => (
                $eventTechnicians->map(static fn ($event) => (
                    Arr::except($event, ['event'])
                ))
            ),
            EventTechnician::SERIALIZE_FOR_TECHNICIAN => (
                $eventTechnicians->map(static fn ($event) => (
                    Arr::except($event, ['technician'])
                ))
            ),
            default => throw new \InvalidArgumentException(sprintf("Unknown format \"%s\"", $format)),
        };

        return static::dataFactory($id, $eventTechnicians->all());
    }

    public function testGetOneEventTechnician(): void
    {
        $this->client->get('/api/event-technicians/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1));
    }

    public function testCreateEventTechnician(): void
    {
        $data = [
            'event_id' => 1,
            'technician_id' => 2,
            'period' => [
                'start' => '2018-12-17 10:00:00',
                'end' => '2018-12-17 20:30:00',
                'isFullDays' => false,
            ],
            'position' => 'Testeur',
        ];
        $this->client->post('/api/event-technicians', $data);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 4,
            'event_id' => 1,
            'technician_id' => 2,
            'period' => [
                'start' => '2018-12-17 10:00:00',
                'end' => '2018-12-17 20:30:00',
                'isFullDays' => false,
            ],
            'position' => 'Testeur',
            'technician' => TechniciansTest::data(2),
        ]);
    }

    public function testUpdateEventTechnicianNoData(): void
    {
        $this->client->put('/api/event-technicians/1', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testUpdateEventTechnician(): void
    {
        $data = [
            'position' => 'Régisseur général',
            'period' => [
                'start' => '2018-12-17 10:00:00',
                'end' => '2018-12-18 20:00:00',
                'isFullDays' => false,
            ],
        ];
        $this->client->put('/api/event-technicians/1', $data);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace(self::data(1), [
            'position' => 'Régisseur général',
            'period' => [
                'start' => '2018-12-17 10:00:00',
                'end' => '2018-12-18 20:00:00',
                'isFullDays' => false,
            ],
        ]));
    }

    public function testDestroyEventTechnician(): void
    {
        $this->client->delete('/api/event-technicians/2');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
    }
}
