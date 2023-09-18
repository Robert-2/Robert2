<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Loxya\Models\Event;
use Loxya\Models\Material;
use Loxya\Support\Arr;
use Loxya\Support\Filesystem\UploadedFile;

final class MaterialsTest extends ApiTestCase
{
    public static function data(int $id, string $format = Material::SERIALIZE_DEFAULT)
    {
        $materials = new Collection([
            [
                'id' => 1,
                'name' => 'Console Yamaha CL3',
                'reference' => 'CL3',
                'description' => 'Console numérique 64 entrées / 8 sorties + Master + Sub',
                'is_unitary' => false,
                'park_id' => 1,
                'park_location_id' => null,
                'category_id' => 1,
                'sub_category_id' => 1,
                'rental_price' => 300,
                'stock_quantity' => 5,
                'out_of_order_quantity' => 1,
                'replacement_price' => 19400,
                'is_hidden_on_bill' => false,
                'is_discountable' => false,
                'is_reservable' => true,
                'picture' => 'http://loxya.test/materials/1/picture',
                'note' => null,
                'attributes' => [
                    [
                        'id' => 1,
                        'name' => 'Poids',
                        'type' => 'float',
                        'unit' => 'kg',
                        'value' => 36.5,
                        'isTotalisable' => true,
                    ],
                    [
                        'id' => 2,
                        'name' => 'Couleur',
                        'type' => 'string',
                        'value' => 'Grise',
                        'maxLength' => null,
                    ],
                    [
                        'id' => 3,
                        'name' => 'Puissance',
                        'type' => 'integer',
                        'unit' => 'W',
                        'value' => 850,
                        'isTotalisable' => true,
                    ],
                ],
                'tags' => [
                    TagsTest::data(1),
                ],
                'created_at' => '2021-02-12 23:00:00',
                'updated_at' => '2021-02-12 23:00:00',
                'deleted_at' => null,
            ],
            [
                'id' => 2,
                'name' => 'Processeur DBX PA2',
                'reference' => 'DBXPA2',
                'description' => 'Système de diffusion numérique',
                'is_unitary' => false,
                'park_id' => 1,
                'park_location_id' => null,
                'category_id' => 1,
                'sub_category_id' => 2,
                'rental_price' => 25.5,
                'stock_quantity' => 2,
                'out_of_order_quantity' => 0,
                'replacement_price' => 349.9,
                'is_hidden_on_bill' => false,
                'is_discountable' => true,
                'is_reservable' => false,
                'picture' => null,
                'note' => null,
                'attributes' => [
                    [
                        'id' => 1,
                        'name' => 'Poids',
                        'type' => 'float',
                        'unit' => 'kg',
                        'value' => 2.2,
                        'isTotalisable' => true,
                    ],
                    [
                        'id' => 3,
                        'name' => 'Puissance',
                        'type' => 'integer',
                        'unit' => 'W',
                        'value' => 35,
                        'isTotalisable' => true,
                    ],
                ],
                'tags' => [
                    TagsTest::data(1),
                ],
                'created_at' => '2021-02-12 23:01:00',
                'updated_at' => '2021-02-12 23:02:00',
                'deleted_at' => null,
            ],
            [
                'id' => 3,
                'name' => 'PAR64 LED',
                'reference' => 'PAR64LED',
                'description' => 'Projecteur PAR64 à LED, avec son set de gélatines',
                'is_unitary' => false,
                'park_id' => 1,
                'park_location_id' => null,
                'category_id' => 2,
                'sub_category_id' => 3,
                'rental_price' => 3.5,
                'stock_quantity' => 34,
                'out_of_order_quantity' => 4,
                'replacement_price' => 89,
                'is_hidden_on_bill' => false,
                'is_discountable' => true,
                'is_reservable' => true,
                'picture' => null,
                'note' => 'Soyez délicats avec ces projos !',
                'attributes' => [
                    [
                        'id' => 1,
                        'name' => 'Poids',
                        'type' => 'float',
                        'unit' => 'kg',
                        'value' => 0.85,
                        'isTotalisable' => true,
                    ],
                    [
                        'id' => 3,
                        'name' => 'Puissance',
                        'type' => 'integer',
                        'unit' => 'W',
                        'value' => 150,
                        'isTotalisable' => true,
                    ],
                ],
                'tags' => [
                    TagsTest::data(1),
                ],
                'created_at' => '2021-02-12 23:02:00',
                'updated_at' => '2021-02-12 23:02:00',
                'deleted_at' => null,
            ],
            [
                'id' => 4,
                'name' => 'Showtec SDS-6',
                'reference' => 'SDS-6-01',
                'description' => "Console DMX (jeu d'orgue) Showtec 6 canaux",
                'is_unitary' => false,
                'park_id' => 1,
                'park_location_id' => null,
                'category_id' => 2,
                'sub_category_id' => 4,
                'rental_price' => 15.95,
                'stock_quantity' => 2,
                'out_of_order_quantity' => 0,
                'replacement_price' => 59,
                'is_hidden_on_bill' => false,
                'is_discountable' => true,
                'is_reservable' => true,
                'picture' => null,
                'note' => null,
                'attributes' => [
                    [
                        'id' => 1,
                        'name' => 'Poids',
                        'type' => 'float',
                        'unit' => 'kg',
                        'value' => 3.15,
                        'isTotalisable' => true,
                    ],
                    [
                        'id' => 3,
                        'name' => 'Puissance',
                        'type' => 'integer',
                        'unit' => 'W',
                        'value' => 60,
                        'isTotalisable' => true,
                    ],
                    [
                        'id' => 4,
                        'name' => 'Conforme',
                        'type' => 'boolean',
                        'value' => true,
                    ],
                ],
                'tags' => [],
                'created_at' => '2021-02-12 23:03:00',
                'updated_at' => '2021-02-12 23:03:00',
                'deleted_at' => null,
            ],
            [
                'id' => 5,
                'name' => 'Câble XLR 10m',
                'reference' => 'XLR10',
                'description' => 'Câble audio XLR 10 mètres, mâle-femelle',
                'is_unitary' => false,
                'park_id' => 1,
                'park_location_id' => null,
                'category_id' => 1,
                'sub_category_id' => null,
                'rental_price' => 0.5,
                'stock_quantity' => 40,
                'out_of_order_quantity' => 8,
                'replacement_price' => 9.5,
                'is_hidden_on_bill' => true,
                'is_discountable' => true,
                'is_reservable' => true,
                'picture' => null,
                'note' => null,
                'attributes' => [],
                'tags' => [],
                'created_at' => '2021-02-12 23:14:00',
                'updated_at' => '2021-02-12 23:14:00',
                'deleted_at' => null,
            ],
            [
                'id' => 6,
                'name' => 'Behringer X Air XR18',
                'description' => 'Mélangeur numérique 18 canaux',
                'reference' => 'XR18',
                'is_unitary' => false,
                'park_id' => 1,
                'park_location_id' => null,
                'category_id' => 1,
                'sub_category_id' => 1,
                'rental_price' => 49.99,
                'stock_quantity' => 3,
                'out_of_order_quantity' => 1,
                'replacement_price' => 419,
                'is_hidden_on_bill' => false,
                'is_discountable' => false,
                'is_reservable' => true,
                'picture' => null,
                'note' => null,
                'tags' => [],
                'attributes' => [
                    [
                        'id' => 5,
                        'name' => "Date d'achat",
                        'type' => 'date',
                        'value' => '2021-01-28',
                    ],
                ],
                'created_at' => '2021-02-12 23:15:00',
                'updated_at' => '2021-02-12 23:15:00',
                'deleted_at' => null,
            ],
            [
                'id' => 7,
                'name' => 'Volkswagen Transporter',
                'description' => 'Volume utile: 9.3 m3',
                'reference' => 'Transporter',
                'is_unitary' => false,
                'park_id' => 2,
                'park_location_id' => null,
                'category_id' => 3,
                'sub_category_id' => null,
                'rental_price' => 300,
                'stock_quantity' => 2,
                'out_of_order_quantity' => 0,
                'replacement_price' => 32000,
                'is_hidden_on_bill' => false,
                'is_discountable' => false,
                'is_reservable' => true,
                'picture' => null,
                'note' => null,
                'tags' => [],
                'attributes' => [],
                'created_at' => '2021-02-12 23:16:00',
                'updated_at' => '2021-02-12 23:16:00',
                'deleted_at' => null,
            ],
            [
                'id' => 8,
                'name' => 'Décor Thème Forêt',
                'description' => 'Forêt mystique, typique des récits fantastiques.',
                'reference' => 'Decor-Forest',
                'is_unitary' => false,
                'park_id' => 1,
                'park_location_id' => null,
                'category_id' => 4,
                'sub_category_id' => null,
                'rental_price' => 1500,
                'stock_quantity' => 2,
                'out_of_order_quantity' => 0,
                'replacement_price' => 8500,
                'is_hidden_on_bill' => false,
                'is_discountable' => true,
                'is_reservable' => true,
                'picture' => null,
                'note' => null,
                'tags' => [],
                'attributes' => [],
                'created_at' => '2021-02-12 23:18:00',
                'updated_at' => '2021-02-12 23:18:00',
                'deleted_at' => null,
            ],
        ]);

        $materials = match ($format) {
            Material::SERIALIZE_DEFAULT => $materials,
            Material::SERIALIZE_DETAILS => $materials,
            Material::SERIALIZE_PUBLIC => $materials->map(fn($material) => (
                Arr::only($material, [
                    'id',
                    'name',
                    'description',
                    'picture',
                    'rental_price',
                ])
            )),
            default => throw new \InvalidArgumentException(sprintf("Unknown format \"%s\"", $format)),
        };

        return static::_dataFactory($id, $materials->all());
    }

    public function testGetAll(): void
    {
        $this->client->get('/api/materials');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(8, [
            array_replace_recursive(self::data(6), [
                'available_quantity' => 2,
            ]),
            array_replace_recursive(self::data(5), [
                'available_quantity' => 32,
            ]),
            array_replace_recursive(self::data(1), [
                'available_quantity' => 4,
            ]),
            array_replace_recursive(self::data(8), [
                'available_quantity' => 2,
            ]),
            array_replace_recursive(self::data(3), [
                'available_quantity' => 30,
            ]),
            array_replace_recursive(self::data(2), [
                'available_quantity' => 2,
            ]),
            array_replace_recursive(self::data(4), [
                'available_quantity' => 2,
            ]),
            array_replace_recursive(self::data(7), [
                'available_quantity' => 2,
            ]),
        ]);

        $this->client->get('/api/materials?orderBy=reference&ascending=0');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(8);
        $results = $this->_getResponseAsArray();

        $expectedResults = [
            'XR18',
            'XLR10',
            'Transporter',
            'SDS-6-01',
            'PAR64LED',
            'Decor-Forest',
            'DBXPA2',
            'CL3',
        ];
        foreach ($expectedResults as $index => $expected) {
            $this->assertEquals($expected, $results['data'][$index]['reference']);
        }

        $this->client->get('/api/materials?paginated=0');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $results = $this->_getResponseAsArray();
        $this->assertCount(8, $results);
        $this->assertEquals('Behringer X Air XR18', $results[0]['name']);
        $this->assertEquals(3, $results[0]['stock_quantity']);
        $this->assertEquals(2, $results[0]['available_quantity']);

        $this->client->get('/api/materials?deleted=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(0);
    }

    public function testGetAllSearchByName(): void
    {
        $this->client->get('/api/materials?search=console');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1);
        $results = $this->_getResponseAsArray();
        $this->assertEquals('CL3', $results['data'][0]['reference']);
    }

    public function testGetMaterialNotFound(): void
    {
        $this->client->get('/api/materials/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testGetAllWhileEvent(): void
    {
        $this->client->get('/api/materials/while-event/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            array_replace_recursive(self::data(1), [
                'available_quantity' => 1,
            ]),
            array_replace_recursive(self::data(2), [
                'available_quantity' => 0,
            ]),
            array_replace_recursive(self::data(8), [
                'available_quantity' => 2,
            ]),
            array_replace_recursive(self::data(3), [
                'available_quantity' => 30,
            ]),
            array_replace_recursive(self::data(4), [
                'available_quantity' => 2,
            ]),
            array_replace_recursive(self::data(7), [
                'available_quantity' => 2,
            ]),
            array_replace_recursive(self::data(5), [
                'available_quantity' => 32,
            ]),
            array_replace_recursive(self::data(6), [
                'available_quantity' => 2,
            ]),
        ]);
    }

    public function testGetOne(): void
    {
        $this->client->get('/api/materials/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1, Material::SERIALIZE_DETAILS));
    }

    public function testGetTagsNotFound(): void
    {
        $this->client->get('/api/materials/999/tags');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testGetTags(): void
    {
        $this->client->get('/api/materials/1/tags');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            TagsTest::data(1),
        ]);
    }

    public function testGetAllByTagsNotFound(): void
    {
        $this->client->get('/api/materials?tags[0]=notFound');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'pagination' => [
                'currentPage' => 1,
                'perPage' => 100,
                'total' => ['items' => 0, 'pages' => 1],
            ],
            'data' => [],
        ]);
    }

    public function testGetAllByTags(): void
    {
        $this->client->get('/api/materials?tags[0]=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(3);
    }

    public function testGetAllByPark(): void
    {
        $this->client->get('/api/materials?park=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(7);
    }

    public function testGetAllByCategoryAndSubCategory(): void
    {
        $this->client->get('/api/materials?category=1&subCategory=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(2);
    }

    public function testGetAllWithDateForQuantities(): void
    {
        // - Récupère le matériel avec les quantités qu'il reste pour un jour
        // - pendant lequel se déroulent les événements n°1 et n°2
        $this->client->get('/api/materials?dateForQuantities=2018-12-18');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertCount(8, $response['data']);

        foreach ([2, 32, 0, 2, 30, 0, 1, 2] as $index => $expected) {
            $this->assertArrayHasKey('available_quantity', $response['data'][$index]);
            $this->assertEquals($expected, $response['data'][$index]['available_quantity']);
        }

        // - Récupère le matériel avec les quantités qu'il reste pour une période
        // - pendant laquelle se déroulent les événements n°1, n°2 et n°3
        $this->client->get('/api/materials?dateForQuantities[start]=2018-12-16&dateForQuantities[end]=2018-12-19');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertCount(8, $response['data']);

        foreach ([2, 20, 0, 2, 20, 0, 1, 2] as $index => $expected) {
            $this->assertArrayHasKey('available_quantity', $response['data'][$index]);
            $this->assertEquals($expected, $response['data'][$index]['available_quantity']);
        }

        // - Test avec une période non valide (retourne les quantités en stock uniquement)
        $this->client->get('/api/materials?dateForQuantities[end]=2018-12-18');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertCount(8, $response['data']);

        foreach ([3, 40, 5, 2, 34, 2, 2, 2] as $index => $expected) {
            $this->assertNotContains('available_quantity', $response['data'][$index]);
            $this->assertEquals($expected, $response['data'][$index]['stock_quantity']);
        }
    }

    public function testCreateWithoutData(): void
    {
        $this->client->post('/api/materials');
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testCreateBadData(): void
    {
        $this->client->post('/api/materials', [
            'name' => 'Analog Mixing Console Yamaha RM800',
            'reference' => '',
            'park_id' => 1,
            'category_id' => 1,
            'sub_category_id' => 1,
            'rental_price' => 100,
            'stock_quantity' => 1,
        ]);
        $this->assertApiValidationError([
            'reference' => ['This field is mandatory'],
        ]);
    }

    public function testCreateDuplicate(): void
    {
        $this->client->post('/api/materials', [
            'name' => 'Analog Mixing Console Yamaha CL3',
            'reference' => 'CL3',
            'park_id' => 1,
            'category_id' => 1,
            'sub_category_id' => 1,
            'rental_price' => 500,
            'stock_quantity' => 1,
        ]);
        $this->assertApiValidationError();
    }

    public function testCreateWithTags(): void
    {
        Carbon::setTestNow(Carbon::create(2022, 10, 22, 18, 42, 36));

        $this->client->post('/api/materials', [
            'name' => 'Analog Mixing Console Yamaha RM800',
            'reference' => 'RM800',
            'park_id' => 1,
            'category_id' => 1,
            'sub_category_id' => 1,
            'rental_price' => 100.0,
            'replacement_price' => 357.0,
            'stock_quantity' => 1,
            'tags' => [2, 1],
        ]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 9,
            'name' => 'Analog Mixing Console Yamaha RM800',
            'reference' => 'RM800',
            'is_unitary' => false,
            'park_id' => 1,
            'park_location_id' => null,
            'category_id' => 1,
            'sub_category_id' => 1,
            'rental_price' => 100,
            'replacement_price' => 357,
            'stock_quantity' => 1,
            'out_of_order_quantity' => null,
            'is_hidden_on_bill' => false,
            'is_discountable' => true,
            'is_reservable' => true,
            'description' => null,
            'picture' => null,
            'note' => null,
            'attributes' => [],
            'tags' => [
                TagsTest::data(1),
                TagsTest::data(2),
            ],
            'created_at' => '2022-10-22 18:42:36',
            'updated_at' => '2022-10-22 18:42:36',
            'deleted_at' => null,
        ]);
    }

    public function testCreateWithAttributes(): void
    {
        Carbon::setTestNow(Carbon::create(2022, 10, 22, 18, 42, 36));

        $this->client->post('/api/materials', [
            'name' => 'Console numérique Yamaha 01V96 V2',
            'reference' => '01V96-v2',
            'park_id' => 1,
            'category_id' => 1,
            'sub_category_id' => 1,
            'rental_price' => 180.0,
            'replacement_price' => 2000.0,
            'stock_quantity' => 2,
            'attributes' => [
                ['id' => 1, 'value' => 12.5],
                ['id' => 3, 'value' => 60],
                ['id' => 4, 'value' => 'true'],
            ],
        ]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 9,
            'name' => 'Console numérique Yamaha 01V96 V2',
            'reference' => '01V96-v2',
            'is_unitary' => false,
            'park_id' => 1,
            'park_location_id' => null,
            'category_id' => 1,
            'sub_category_id' => 1,
            'rental_price' => 180,
            'replacement_price' => 2000,
            'stock_quantity' => 2,
            'out_of_order_quantity' => null,
            'is_hidden_on_bill' => false,
            'is_discountable' => true,
            'is_reservable' => true,
            'description' => null,
            'picture' => null,
            'note' => null,
            'attributes' => [
                [
                    'id' => 1,
                    'name' => 'Poids',
                    'type' => 'float',
                    'unit' => 'kg',
                    'value' => 12.5,
                    'isTotalisable' => true,
                ],
                [
                    'id' => 3,
                    'name' => 'Puissance',
                    'type' => 'integer',
                    'unit' => 'W',
                    'value' => 60,
                    'isTotalisable' => true,
                ],
                [
                    'id' => 4,
                    'name' => 'Conforme',
                    'type' => 'boolean',
                    'value' => true,
                ],
            ],
            'tags' => [],
            'created_at' => '2022-10-22 18:42:36',
            'updated_at' => '2022-10-22 18:42:36',
            'deleted_at' => null,
        ]);
    }

    public function testUpdate(): void
    {
        Carbon::setTestNow(Carbon::create(2023, 5, 26, 16, 0, 0));

        // - Update material #1
        $data = [
            'reference' => 'CL3-v2',
            'stock_quantity' => 6,
        ];
        $this->client->put('/api/materials/1', $data);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace_recursive(
            self::data(1, Material::SERIALIZE_DETAILS),
            [
                'reference' => 'CL3-v2',
                'stock_quantity' => 6,
                'updated_at' => '2023-05-26 16:00:00',
            ]
        ));

        // - Test with a negative value for stock quantity
        $data = ['stock_quantity' => -2];
        $this->client->put('/api/materials/1', $data);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace_recursive(
            self::data(1, Material::SERIALIZE_DETAILS),
            [
                'reference' => 'CL3-v2',
                'stock_quantity' => 0,
                'updated_at' => '2023-05-26 16:00:00',
            ]
        ));

        // - Test with an out-of-order quantity higher than stock quantity
        $data = ['stock_quantity' => 5, 'out_of_order_quantity' => 20];
        $this->client->put('/api/materials/1', $data);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace_recursive(
            self::data(1, Material::SERIALIZE_DETAILS),
            [
                'reference' => 'CL3-v2',
                'stock_quantity' => 5,
                'out_of_order_quantity' => 5,
                'updated_at' => '2023-05-26 16:00:00',
            ]
        ));
    }

    public function testDeleteAndDestroy(): void
    {
        // - First call: soft delete.
        $this->client->delete('/api/materials/5');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $softDeleted = Material::withTrashed()->find(5);
        $this->assertNotNull($softDeleted);
        $this->assertNotEmpty($softDeleted->deleted_at);

        // - Second call: actually DESTROY record from DB
        $this->client->delete('/api/materials/5');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $this->assertNull(Material::withTrashed()->find(5));
    }

    public function testRestoreInexistent(): void
    {
        $this->client->put('/api/materials/999/restore');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testRestore(): void
    {
        // - First, delete material #3
        $this->client->delete('/api/materials/3');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);

        // - Then, restore material #3
        $this->client->put('/api/materials/3/restore');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertNotNull(Material::find(2));
    }

    public function testAttachDocument(): void
    {
        Carbon::setTestNow(Carbon::create(2022, 10, 22, 18, 42, 36));

        $createUploadedFile = function (string $from) {
            $tmpFile = tmpfile();
            fwrite($tmpFile, file_get_contents($from));
            return $tmpFile;
        };

        // - Matériel inexistant.
        $this->client->post('/api/materials/999/documents');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Test sans fichier (payload vide)
        $this->client->post('/api/materials/6/documents');
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("Invalid number of files sent: a single file is expected.");

        // - Test avec des fichiers sans problèmes.
        $validUploads = [
            [
                'id' => 6,
                'file' => new UploadedFile(
                    $createUploadedFile(TESTS_FILES_FOLDER . DS . 'file.pdf'),
                    13269,
                    UPLOAD_ERR_OK,
                    "Facture d'achat.pdf",
                    'application/pdf',
                ),
                'expected' => [
                    'id' => 7,
                    'name' => "Facture d'achat.pdf",
                    'type' => 'application/pdf',
                    'size' => 13269,
                    'url' => 'http://loxya.test/documents/7',
                    'created_at' => '2022-10-22 18:42:36',
                ],
            ],
            [
                'id' => 4,
                'file' => new UploadedFile(
                    $createUploadedFile(TESTS_FILES_FOLDER . DS . 'file.pdf'),
                    13269,
                    UPLOAD_ERR_OK,
                    'Garantie (expire fin 2023).pdf',
                    'application/pdf',
                ),
                'expected' => [
                    'id' => 8,
                    'name' => 'Garantie (expire fin 2023).pdf',
                    'type' => 'application/pdf',
                    'size' => 13269,
                    'url' => 'http://loxya.test/documents/8',
                    'created_at' => '2022-10-22 18:42:36',
                ],
            ],
            [
                'id' => 4,
                'file' => new UploadedFile(
                    $createUploadedFile(TESTS_FILES_FOLDER . DS . 'file.pdf'),
                    156325,
                    UPLOAD_ERR_OK,
                    'Notice.pdf',
                    'application/pdf',
                ),
                'expected' => [
                    'id' => 9,
                    'name' => 'Notice.pdf',
                    'type' => 'application/pdf',
                    'size' => 156325,
                    'url' => 'http://loxya.test/documents/9',
                    'created_at' => '2022-10-22 18:42:36',
                ],
            ],
        ];
        foreach ($validUploads as $validUpload) {
            $url = sprintf('/api/materials/%d/documents', $validUpload['id']);
            $this->client->post($url, null, $validUpload['file']);
            $this->assertStatusCode(StatusCode::STATUS_CREATED);
            $this->assertResponseData($validUpload['expected']);
        }
        $this->assertSame([7], Material::findOrFail(6)->documents->pluck('id')->all());
        $this->assertSame([8, 9], Material::findOrFail(4)->documents->pluck('id')->all());

        // - Test avec des fichiers avec erreurs.
        $invalidUploads = [
            [
                'file' => new UploadedFile(
                    $createUploadedFile(TESTS_FILES_FOLDER . DS . 'file.pdf'),
                    262144000,
                    UPLOAD_ERR_OK,
                    'Un fichier bien trop volumineux.pdf',
                    'application/pdf',
                ),
                'expected' => ['This file exceeds maximum size allowed.'],
            ],
            [
                'file' => new UploadedFile(
                    $createUploadedFile(TESTS_FILES_FOLDER . DS . 'file.csv'),
                    54,
                    UPLOAD_ERR_CANT_WRITE,
                    'échec-upload.csv',
                    'text/csv',
                ),
                'expected' => ['File upload failed.'],
            ],
            [
                'file' => new UploadedFile(
                    tmpfile(),
                    121540,
                    UPLOAD_ERR_OK,
                    'app.dmg',
                    'application/octet-stream',
                ),
                'expected' => ['This file type is not allowed.'],
            ],
        ];
        foreach ($invalidUploads as $invalidUpload) {
            $this->client->post('/api/materials/6/documents', null, $invalidUpload['file']);
            $this->assertApiValidationError(['file' => $invalidUpload['expected']]);
        }
    }

    public function testGetDocuments(): void
    {
        // - Matériel inexistant.
        $this->client->get('/api/materials/999/documents');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Documents du matériel #1.
        $this->client->get('/api/materials/1/documents');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            DocumentsTest::data(1),
            DocumentsTest::data(2),
        ]);

        // - Documents du matériel #2
        $this->client->get('/api/materials/2/documents');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([]);
    }

    public function testGetBookings(): void
    {
        $this->client->get('/api/materials/1/bookings');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            array_replace(
                EventsTest::data(7, Event::SERIALIZE_BOOKING_SUMMARY),
                [
                    'entity' => 'event',
                    'pivot' => ['quantity' => 2],
                ],
            ),
            array_replace(
                EventsTest::data(4, Event::SERIALIZE_BOOKING_SUMMARY),
                [
                    'entity' => 'event',
                    'pivot' => ['quantity' => 1],
                ],
            ),
            array_replace(
                EventsTest::data(2, Event::SERIALIZE_BOOKING_SUMMARY),
                [
                    'entity' => 'event',
                    'pivot' => ['quantity' => 3],
                ],
            ),
            array_replace(
                EventsTest::data(1, Event::SERIALIZE_BOOKING_SUMMARY),
                [
                    'entity' => 'event',
                    'pivot' => ['quantity' => 1],
                ],
            ),
        ]);
    }

    public function testGetAllPdf(): void
    {
        Carbon::setTestNow(Carbon::create(2022, 9, 23, 12, 0, 0));

        $responseStream = $this->client->get('/materials/pdf');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertTrue($responseStream->isReadable());
        $this->assertMatchesHtmlSnapshot($responseStream->getContents());
    }
}
