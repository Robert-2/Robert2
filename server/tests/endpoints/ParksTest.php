<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Collection;
use Robert2\Support\Arr;

final class ParksTest extends ApiTestCase
{
    public static function data(int $id, $details = false)
    {
        $attributes = new Collection([
            [
                'id' => 1,
                'name' => 'default',
                'street' => 'Hangar 951',
                'postal_code' => '01234',
                'locality' => 'Secretville',
                'country_id' => 1,
                'opening_hours' => "Du lundi au vendredi, de 09:00 à 19:00.",
                'note' => null,
                'total_items' => 6,
                'total_stock_quantity' => 83,
                'has_ongoing_booking' => false,
            ],
            [
                'id' => 2,
                'name' => 'spare',
                'street' => null,
                'postal_code' => null,
                'locality' => null,
                'country_id' => null,
                'opening_hours' => null,
                'note' => "Les bidouilles de fond de tiroir",
                'total_items' => 2,
                'total_stock_quantity' => 2,
                'has_ongoing_booking' => false,
            ],
        ]);

        if (!$details) {
            $attributes = $attributes->map(fn($attribute) => (
                Arr::except($attribute, [
                    'has_ongoing_booking',
                ])
            ));
        }

        return static::_dataFactory($id, $attributes->all());
    }

    public function testGetAll()
    {
        $this->client->get('/api/parks');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(2, [
            self::data(1),
            self::data(2),
        ]);

        $this->client->get('/api/parks?deleted=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(0);
    }

    public function testGetList()
    {
        $this->client->get('/api/parks/list');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(
            (new Collection([self::data(1), self::data(2)]))
                ->map(fn($park) => Arr::only($park, ['id', 'name']))
                ->all()
        );
    }

    public function testGetOneNotFound()
    {
        $this->client->get('/api/parks/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testGetOne()
    {
        $this->client->get('/api/parks/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1, true));
    }

    public function testGetOneMaterials()
    {
        $this->client->get('/api/parks/2/materials');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            MaterialsTest::data(7),
            MaterialsTest::data(8),
        ]);
    }

    public function testGetOneTotalAmountNotFound()
    {
        $this->client->get('/api/parks/999/total-amount');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testGetOneTotalAmount()
    {
        $this->client->get('/api/parks/1/total-amount');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'id' => 1,
            'totalAmount' => 101223.80,
        ]);
    }

    public function testCreate()
    {
        $this->client->post('/api/parks', [
            'name' => 'Un nouveau parc',
        ]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 3,
            'name' => 'Un nouveau parc',
            'street' => null,
            'postal_code' => null,
            'locality' => null,
            'country_id' => null,
            'opening_hours' => null,
            'note' => null,
            'total_items' => 0,
            'total_stock_quantity' => 0,
            'has_ongoing_booking' => false,
        ]);
    }

    public function testUpdate()
    {
        $this->client->put('/api/parks/1', [
            'name' => 'Mon parc',
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(
            array_replace(self::data(1, true), [
                // - Uniquement le nom a été modifié.
                'name' => 'Mon parc',
            ])
        );
    }
}
