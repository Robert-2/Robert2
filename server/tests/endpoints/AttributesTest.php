<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\Support\Arr;
use Illuminate\Support\Collection;

final class AttributesTest extends ApiTestCase
{
    public static function data(int $id, $details = false)
    {
        $attributes = new Collection([
            [
                'id' => 1,
                'name' => "Poids",
                'type' => "float",
                'unit' => "kg",
                'categories' => [
                    CategoriesTest::data(2),
                    CategoriesTest::data(1),
                ],
            ],
            [
                'id' => 2,
                'name' => "Couleur",
                'type' => "string",
                'maxLength' => null,
                'categories' => [],
            ],
            [
                'id' => 3,
                'name' => "Puissance",
                'type' => "integer",
                'unit' => "W",
                'categories' => [
                    CategoriesTest::data(1),
                ],
            ],
            [
                'id' => 4,
                'name' => "Conforme",
                'type' => "boolean",
                'categories' => [],
            ],
            [
                'id' => 5,
                'name' => "Date d'achat",
                'type' => "date",
                'categories' => [],
            ],
        ]);

        if (!$details) {
            $attributes = $attributes->map(fn($attribute) => (
                Arr::except($attribute, ['categories'])
            ));
        }

        return static::_dataFactory($id, $attributes->all());
    }

    public function testGetAll()
    {
        // - Récupère toutes les caractéristiques spéciales avec leurs catégories
        $this->client->get('/api/attributes');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(4, true),
            self::data(2, true),
            self::data(5, true),
            self::data(1, true),
            self::data(3, true),
        ]);
    }

    public function testGetAllForCategory()
    {
        // - Récupère les caractéristiques spéciales qui n'ont
        // - pas de catégorie, + celles de la catégorie #3
        $this->client->get('/api/attributes?category=3');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(4, true),
            self::data(2, true),
            self::data(5, true),
        ]);

        // - Récupère les caractéristiques spéciales qui n'ont
        // - pas de catégorie, + celles de la catégorie #2
        $this->client->get('/api/attributes?category=2');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(4, true),
            self::data(2, true),
            self::data(5, true),
            self::data(1, true),
        ]);
    }

    public function testGetAllWithoutCategory()
    {
        // - Récupère les caractéristiques spéciales qui n'ont pas de catégorie.
        $this->client->get('/api/attributes?category=none');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(4, true),
            self::data(2, true),
            self::data(5, true),
        ]);
    }

    public function testCreateAttribute()
    {
        $this->client->post('/api/attributes', [
            'name' => 'Speed',
            'type' => 'float',
            'unit' => 'km/h',
            'categories' => [2, 3],
        ]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 6,
            'name' => 'Speed',
            'type' => 'float',
            'unit' => 'km/h',
            'categories' => [
                CategoriesTest::data(2),
                CategoriesTest::data(3),
            ],
        ]);
    }

    public function testUpdateAttribute()
    {
        $this->client->put('/api/attributes/1', [
            'name' => 'Masse',
            'type' => 'integer',
            'unit' => 'g',
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(
            array_replace(self::data(1, true), [
                // - Uniquement le nom a été modifié.
                'name' => 'Masse',
            ])
        );
    }
}
