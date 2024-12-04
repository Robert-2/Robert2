<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

final class CountriesTest extends ApiTestCase
{
    public static function data(?int $id = null)
    {
        return static::dataFactory($id, [
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

    public function testGetAll(): void
    {
        $this->client->get('/api/countries');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data());
    }

    public function testGetOne(): void
    {
        // - Test avec un pays inexistant.
        $this->client->get('/api/countries/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Test valide.
        $this->client->get('/api/countries/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1));
    }
}
