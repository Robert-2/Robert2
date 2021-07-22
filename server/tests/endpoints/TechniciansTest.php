<?php
namespace Robert2\Tests;

final class TechniciansTest extends ApiTestCase
{
    public function testGetEventNotFound()
    {
        $this->client->get('/api/technicians/999/events');
        $this->assertNotFound();
    }

    public function testGetEvents()
    {
        $this->client->get('/api/technicians/1/events');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            [
                'id' => 1,
                'event_id' => 1,
                'technician_id' => 1,
                'start_time' => '2018-12-17 09:00:00',
                'end_time' => '2018-12-18 22:00:00',
                'position' => 'Régisseur',
                'event' => [
                    'id' => 1,
                    'user_id' => 1,
                    'title' => 'Premier événement',
                    'description' => null,
                    'reference' => null,
                    'start_date' => '2018-12-17 00:00:00',
                    'end_date' => '2018-12-18 23:59:59',
                    'is_confirmed' => false,
                    'is_archived' => false,
                    'location' => 'Gap',
                    'is_billable' => true,
                    'is_return_inventory_done' => true,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
            ],
        ]);

        $this->client->get('/api/technicians/2/events');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            [
                'id' => 2,
                'event_id' => 1,
                'technician_id' => 2,
                'start_time' => '2018-12-18 14:00:00',
                'end_time' => '2018-12-18 18:00:00',
                'position' => 'Technicien plateau',
                'event' => [
                    'id' => 1,
                    'user_id' => 1,
                    'title' => 'Premier événement',
                    'description' => null,
                    'reference' => null,
                    'start_date' => '2018-12-17 00:00:00',
                    'end_date' => '2018-12-18 23:59:59',
                    'is_confirmed' => false,
                    'is_archived' => false,
                    'location' => 'Gap',
                    'is_billable' => true,
                    'is_return_inventory_done' => true,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
            ],
        ]);

        $this->client->get('/api/technicians/3/events');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([]);
    }
}
