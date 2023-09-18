<?php
declare(strict_types=1);

namespace Loxya\Tests;

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

    public function testGetCountries(): void
    {
        $this->client->get('/api/countries');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(1),
            self::data(2),
            self::data(3),
        ]);
    }

    public function testGetCountryNotFound(): void
    {
        $this->client->get('/api/countries/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testGetCountry(): void
    {
        $this->client->get('/api/countries/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1));
    }
}
