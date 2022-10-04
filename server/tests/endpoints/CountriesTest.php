<?php
namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

final class CountriesTest extends ApiTestCase
{
    public static function data(int $id)
    {
        return static::_dataFactory($id, [
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

    public function testGetCountries()
    {
        $this->client->get('/api/countries');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(1),
            self::data(2),
            self::data(3),
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
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1));
    }
}
