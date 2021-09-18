<?php
namespace Robert2\Tests;

final class CountriesTest extends ApiTestCase
{
    public function testGetCountries()
    {
        $this->client->get('/api/countries');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            [
                'id' => 1,
                'name' => 'France',
                'code' => 'FR',
            ],
            [
                'id' => 2,
                'name' => 'Suisse',
                'code' => 'CH',
            ],
            [
                'id' => 3,
                'name' => 'Belgique',
                'code' => 'BE',
            ],
        ]);
    }

    public function testGetCountryNotFound()
    {
        $this->client->get('/api/countries/999');
        $this->assertNotFound();
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
