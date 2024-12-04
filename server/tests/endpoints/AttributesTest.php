<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Collection;
use Loxya\Models\Attribute;
use Loxya\Models\Enums\AttributeEntity;
use Loxya\Models\Enums\AttributeType;
use Loxya\Support\Arr;

final class AttributesTest extends ApiTestCase
{
    public static function data(?int $id = null, string $format = Attribute::SERIALIZE_DEFAULT)
    {
        $attributes = new Collection([
            [
                'id' => 1,
                'name' => "Poids",
                'entities' => [AttributeEntity::MATERIAL->value],
                'type' => AttributeType::FLOAT->value,
                'unit' => "kg",
                'is_totalisable' => true,
                'categories' => [
                    CategoriesTest::data(2),
                    CategoriesTest::data(1),
                ],
            ],
            [
                'id' => 2,
                'name' => "Couleur",
                'entities' => [
                    AttributeEntity::MATERIAL->value,
                ],
                'type' => AttributeType::STRING->value,
                'max_length' => null,
                'categories' => [],
            ],
            [
                'id' => 3,
                'name' => "Puissance",
                'entities' => [AttributeEntity::MATERIAL->value],
                'type' => AttributeType::INTEGER->value,
                'unit' => "W",
                'is_totalisable' => true,
                'categories' => [
                    CategoriesTest::data(2),
                    CategoriesTest::data(1),
                ],
            ],
            [
                'id' => 4,
                'name' => "Conforme",
                'entities' => [AttributeEntity::MATERIAL->value],
                'type' => AttributeType::BOOLEAN->value,
                'categories' => [],
            ],
            [
                'id' => 5,
                'name' => "Date d'achat",
                'entities' => [
                    AttributeEntity::MATERIAL->value,
                ],
                'type' => AttributeType::DATE->value,
                'categories' => [],
            ],
            [
                'id' => 6,
                'name' => "Nettoyé le",
                'entities' => [AttributeEntity::MATERIAL->value],
                'type' => AttributeType::DATE->value,
                'categories' => [
                    CategoriesTest::data(4),
                    CategoriesTest::data(3),
                ],
            ],
            [
                'id' => 7,
                'name' => "Immatriculation",
                'entities' => [AttributeEntity::MATERIAL->value],
                'type' => AttributeType::STRING->value,
                'max_length' => null,
                'categories' => [
                    CategoriesTest::data(3),
                ],
            ],
            [
                'id' => 8,
                'name' => "Prix d'achat",
                'entities' => [
                    AttributeEntity::MATERIAL->value,
                ],
                'type' => AttributeType::FLOAT->value,
                'unit' => "€",
                'is_totalisable' => true,
                'categories' => [],
            ],
        ]);

        $attributes = match ($format) {
            Attribute::SERIALIZE_DEFAULT => $attributes->map(static fn ($attribute) => (
                Arr::except($attribute, ['categories'])
            )),
            Attribute::SERIALIZE_DETAILS => $attributes,
            default => throw new \InvalidArgumentException(sprintf("Unknown format \"%s\"", $format)),
        };

        return static::dataFactory($id, $attributes->all());
    }

    public function testGetAll(): void
    {
        // - Récupère toutes les caractéristiques spéciales avec leurs catégories.
        $this->client->get('/api/attributes');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(4, Attribute::SERIALIZE_DETAILS),
            self::data(2, Attribute::SERIALIZE_DETAILS),
            self::data(5, Attribute::SERIALIZE_DETAILS),
            self::data(7, Attribute::SERIALIZE_DETAILS),
            self::data(6, Attribute::SERIALIZE_DETAILS),
            self::data(1, Attribute::SERIALIZE_DETAILS),
            self::data(8, Attribute::SERIALIZE_DETAILS),
            self::data(3, Attribute::SERIALIZE_DETAILS),
        ]);

        // - Récupère les caractéristiques spéciales qui n'ont
        // - pas de catégorie, + celles de la catégorie #3.
        $this->client->get('/api/attributes?category=3');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(4, Attribute::SERIALIZE_DETAILS),
            self::data(2, Attribute::SERIALIZE_DETAILS),
            self::data(5, Attribute::SERIALIZE_DETAILS),
            self::data(7, Attribute::SERIALIZE_DETAILS),
            self::data(6, Attribute::SERIALIZE_DETAILS),
            self::data(8, Attribute::SERIALIZE_DETAILS),
        ]);

        // - Récupère les caractéristiques spéciales qui n'ont
        // - pas de catégorie, + celles de la catégorie #2.
        $this->client->get('/api/attributes?category=2');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(4, Attribute::SERIALIZE_DETAILS),
            self::data(2, Attribute::SERIALIZE_DETAILS),
            self::data(5, Attribute::SERIALIZE_DETAILS),
            self::data(1, Attribute::SERIALIZE_DETAILS),
            self::data(8, Attribute::SERIALIZE_DETAILS),
            self::data(3, Attribute::SERIALIZE_DETAILS),
        ]);

        // - Récupère les caractéristiques spéciales qui n'ont pas de catégorie.
        $this->client->get('/api/attributes?category=none');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(4, Attribute::SERIALIZE_DETAILS),
            self::data(2, Attribute::SERIALIZE_DETAILS),
            self::data(5, Attribute::SERIALIZE_DETAILS),
            self::data(8, Attribute::SERIALIZE_DETAILS),
        ]);

        // - Récupère les caractéristiques spéciales liées au matériel uniquement.
        $this->client->get('/api/attributes?entity=material');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(4, Attribute::SERIALIZE_DETAILS),
            self::data(2, Attribute::SERIALIZE_DETAILS),
            self::data(5, Attribute::SERIALIZE_DETAILS),
            self::data(7, Attribute::SERIALIZE_DETAILS),
            self::data(6, Attribute::SERIALIZE_DETAILS),
            self::data(1, Attribute::SERIALIZE_DETAILS),
            self::data(8, Attribute::SERIALIZE_DETAILS),
            self::data(3, Attribute::SERIALIZE_DETAILS),
        ]);
    }

    public function testGetOne(): void
    {
        $this->client->get('/api/attributes/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1, Attribute::SERIALIZE_DETAILS));
    }

    public function testCreate(): void
    {
        $this->client->post('/api/attributes', [
            'name' => 'Speed',
            'entities' => [
                AttributeEntity::MATERIAL->value,
            ],
            'type' => AttributeType::FLOAT->value,
            'unit' => 'km/h',
            'categories' => [2, 3],
            'is_totalisable' => false,
        ]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 9,
            'name' => 'Speed',
            'entities' => [
                AttributeEntity::MATERIAL->value,
            ],
            'type' => AttributeType::FLOAT->value,
            'unit' => 'km/h',
            'categories' => [
                CategoriesTest::data(2),
                CategoriesTest::data(3),
            ],
            'is_totalisable' => false,
        ]);
    }

    public function testUpdate(): void
    {
        $this->client->put('/api/attributes/1', [
            'name' => 'Masse',
            'entities' => [
                // FIXME: Si une seule valeur est passée dans ce tableau, ça plante.
                AttributeEntity::MATERIAL->value,
                AttributeEntity::MATERIAL->value,
            ],
            'type' => AttributeType::INTEGER->value,
            'unit' => 'g',
            'categories' => [3, 4],
            'is_totalisable' => false,
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace(
            self::data(1, Attribute::SERIALIZE_DETAILS),
            [
                'name' => 'Masse',
                'entities' => [
                    AttributeEntity::MATERIAL->value,
                ],
                'unit' => 'g',
                'is_totalisable' => false,
                'categories' => [
                    CategoriesTest::data(4),
                    CategoriesTest::data(3),
                ],
            ],
        ));
    }
}
