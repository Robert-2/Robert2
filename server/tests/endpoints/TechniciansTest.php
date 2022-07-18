<?php
namespace Robert2\Tests;

final class TechniciansTest extends ApiTestCase
{
    public function testGetAll()
    {
        $this->client->get('/api/technicians');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'pagination' => [
                'currentPage' => 1,
                'perPage' => $this->settings['maxItemsPerPage'],
                'total' => ['items' => 1, 'pages' => 1],
            ],
            'data' => [
                [
                    'id' => 2,
                    'user_id' => 2,
                    'first_name' => 'Roger',
                    'last_name' => 'Rabbit',
                    'reference' => '0002',
                    'nickname' => 'Riri',
                    'email' => 'tester2@robertmanager.net',
                    'phone' => null,
                    'street' => null,
                    'postal_code' => null,
                    'locality' => null,
                    'country_id' => null,
                    'full_address' => null,
                    'company_id' => null,
                    'note' => null,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                    'full_name' => 'Roger Rabbit',
                    'country' => null,
                    'company' => null,
                ],
            ],
        ]);
    }

    public function testGetAllInPeriod()
    {
        // - Aucun technicien n'est disponible pendant ces dates
        $this->client->get('/api/technicians?startDate=2018-12-15&endDate=2018-12-20');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(0, $response['pagination']['total']['items']);
        $this->assertCount(0, $response['data']);

        // - Un technicien est disponible pendant ces dates
        $this->client->get('/api/technicians?startDate=2019-01-02&endDate=2019-01-06');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(1, $response['pagination']['total']['items']);
        $this->assertCount(1, $response['data']);
    }

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
