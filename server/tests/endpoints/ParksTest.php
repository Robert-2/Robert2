<?php
namespace Robert2\Tests;

final class ParksTest extends ApiTestCase
{
    public function testGetParks()
    {
        $this->client->get('/api/parks');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'pagination' => [
                'current_page' => 1,
                'from' => 1,
                'last_page' => 1,
                'path' => '/api/parks',
                'first_page_url' => '/api/parks?page=1',
                'next_page_url' => null,
                'prev_page_url' => null,
                'last_page_url' => '/api/parks?page=1',
                'per_page' => $this->settings['maxItemsPerPage'],
                'to' => 2,
                'total' => 2,
            ],
            'data' => [
                [
                    'id' => 1,
                    'name' => 'default',
                    'person_id' => 1,
                    'company_id' => null,
                    'street' => 'Hangar 951',
                    'postal_code' => '01234',
                    'locality' => 'Secretville',
                    'country_id' => 1,
                    'opening_hours' => "Du lundi au vendredi, de 09:00 à 19:00.",
                    'note' => null,
                    'total_items' => 7,
                    'total_stock_quantity' => 87,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
                [
                    'id' => 2,
                    'name' => 'spare',
                    'person_id' => null,
                    'company_id' => 1,
                    'street' => null,
                    'postal_code' => null,
                    'locality' => null,
                    'country_id' => null,
                    'opening_hours' => null,
                    'note' => "Les bidouilles de fond de tiroir",
                    'total_items' => 2,
                    'total_stock_quantity' => 2,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
            ],
        ]);

        $this->client->get('/api/parks?deleted=1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(0, '/api/parks', 'deleted=1');
    }

    public function testGetParksList()
    {
        $this->client->get('/api/parks/list');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            ['id' => 1, 'name' => 'default'],
            ['id' => 2, 'name' => 'spare'],
        ]);
    }

    public function testGetParkNotFound()
    {
        $this->client->get('/api/parks/999');
        $this->assertNotFound();
    }

    public function testGetPark()
    {
        $this->client->get('/api/parks/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'name' => 'default',
            'person_id' => 1,
            'company_id' => null,
            'street' => 'Hangar 951',
            'postal_code' => '01234',
            'locality' => 'Secretville',
            'country_id' => 1,
            'opening_hours' => "Du lundi au vendredi, de 09:00 à 19:00.",
            'note' => null,
            'total_items' => 7,
            'total_amount' => 119061.80,
            'total_stock_quantity' => 87,
            'created_at' => null,
            'updated_at' => null,
            'deleted_at' => null,
            'has_ongoing_inventory' => false,
            'has_ongoing_event' => false,
        ]);
    }

    public function testGetTotalAmountNotFound()
    {
        $this->client->get('/api/parks/999/total-amount');
        $this->assertNotFound();
    }

    public function testGetTotalAmount()
    {
        $this->client->get('/api/parks/1/total-amount');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'totalAmount' => 119061.80,
        ]);
    }
}
