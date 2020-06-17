<?php
namespace Robert2\Tests;

final class CountriesTest extends ApiTestCase
{
    public function testGetCountries()
    {
        $this->client->get('/api/countries');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'data' => [
                [
                    'id'         => 1,
                    'name'       => 'France',
                    'code'       => 'FR',
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
                [
                    'id'         => 2,
                    'name'       => 'Suisse',
                    'code'       => 'CH',
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
                [
                    'id'         => 3,
                    'name'       => 'Belgique',
                    'code'       => 'BE',
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
            ],
        ]);
    }

    public function testGetCountryNotFound()
    {
        $this->client->get('/api/countries/999');
        $this->assertStatusCode(ERROR_NOT_FOUND);
        $this->assertNotFoundErrorMessage();
    }

    public function testGetCountry()
    {
        $this->client->get('/api/countries/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id'         => 1,
            'name'       => 'France',
            'code'       => 'FR',
            'created_at' => null,
            'updated_at' => null,
            'deleted_at' => null,
        ]);
    }
}
