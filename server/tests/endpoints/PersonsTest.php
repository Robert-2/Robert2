<?php
namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

final class PersonsTest extends ApiTestCase
{
    public static function data(int $id)
    {
        return static::_dataFactory($id, [
            [
                'id' => 1,
                'user_id' => 1,
                'first_name' => 'Jean',
                'last_name' => 'Fountain',
                'full_name' => 'Jean Fountain',
                'email' => 'tester@robertmanager.net',
                'phone' => null,
                'street' => "1, somewhere av.",
                'postal_code' => '1234',
                'locality' => "Megacity",
                'country_id' => 1,
                'full_address' => "1, somewhere av.\n1234 Megacity",
                'country' => CountriesTest::data(1),
            ],
            [
                'id' => 2,
                'user_id' => 2,
                'first_name' => 'Roger',
                'last_name' => 'Rabbit',
                'full_name' => 'Roger Rabbit',
                'email' => 'tester2@robertmanager.net',
                'phone' => null,
                'street' => null,
                'postal_code' => null,
                'locality' => null,
                'country_id' => null,
                'full_address' => null,
                'country' => null,
            ],
            [
                'id' => 3,
                'user_id' => null,
                'first_name' => 'Client',
                'last_name' => 'Benef',
                'full_name' => 'Client Benef',
                'email' => 'client@beneficiaires.com',
                'phone' => '+33123456789',
                'street' => '156 bis, avenue des tests poussés',
                'postal_code' => '88080',
                'locality' => 'Wazzaville',
                'full_address' => "156 bis, avenue des tests poussés\n88080 Wazzaville",
                'country_id' => null,
                'country' => null,
            ],
            [
                'id' => 4,
                'user_id' => null,
                'first_name' => 'Jean',
                'last_name' => 'Technicien',
                'full_name' => 'Jean Technicien',
                'email' => 'client@technicien.com',
                'phone' => '+33645698520',
                'street' => null,
                'postal_code' => null,
                'locality' => null,
                'country_id' => 2,
                'full_address' => null,
                'country' => CountriesTest::data(2),
            ],
        ]);
    }

    public function testGetAll()
    {
        $this->client->get('/api/persons');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(4, [
            self::data(3),
            self::data(1),
            self::data(2),
            self::data(4),
        ]);
    }

    public function testGetAllWithSearch()
    {
        $this->client->get('/api/persons?search=jea');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(2, [
            self::data(1), // - Jean Fountain
            self::data(4), // - Jean Technicien
        ]);

        $this->client->get('/api/persons?search=jean fou');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            self::data(1), // - Jean Fountain
        ]);

        $this->client->get('/api/persons?search=technicien jean');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1, [
            self::data(4), // - Jean Technicien
        ]);
    }

    public function testGetAllWithLimit()
    {
        $this->client->get('/api/persons?limit=2');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseHasKeyEquals('pagination.perPage', 2);
        $this->assertResponseHasKeyEquals('pagination.total.pages', 2);
        $this->assertResponsePaginatedData(4, [
            self::data(3),
            self::data(1),
        ]);
    }
}
