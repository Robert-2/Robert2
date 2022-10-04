<?php
namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Models\Material;

final class MaterialsTest extends ApiTestCase
{
    public static function data(int $id)
    {
        return static::_dataFactory($id, [
            [
                'id' => 1,
                'name' => 'Console Yamaha CL3',
                'reference' => 'CL3',
                'description' => 'Console numérique 64 entrées / 8 sorties + Master + Sub',
                'is_unitary' => false,
                'park_id' => 1,
                'category_id' => 1,
                'sub_category_id' => 1,
                'rental_price' => 300,
                'stock_quantity' => 5,
                'out_of_order_quantity' => 1,
                'replacement_price' => 19400,
                'is_hidden_on_bill' => false,
                'is_discountable' => false,
                'picture' => 'IMG-20210511-0001.jpg',
                'note' => null,
                'attributes' => [
                    [
                        'id' => 3,
                        'name' => 'Puissance',
                        'type' => 'integer',
                        'unit' => 'W',
                        'value' => 850,
                    ],
                    [
                        'id' => 2,
                        'name' => 'Couleur',
                        'type' => 'string',
                        'unit' => null,
                        'value' => 'Grise',
                    ],
                    [
                        'id' => 1,
                        'name' => 'Poids',
                        'type' => 'float',
                        'unit' => 'kg',
                        'value' => 36.5,
                    ],
                ],
                'tags' => [
                    TagsTest::data(1),
                ],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 2,
                'name' => 'Processeur DBX PA2',
                'reference' => 'DBXPA2',
                'description' => 'Système de diffusion numérique',
                'is_unitary' => false,
                'park_id' => 1,
                'category_id' => 1,
                'sub_category_id' => 2,
                'rental_price' => 25.5,
                'stock_quantity' => 2,
                'out_of_order_quantity' => null,
                'replacement_price' => 349.9,
                'is_hidden_on_bill' => false,
                'is_discountable' => true,
                'picture' => null,
                'note' => null,
                'attributes' => [
                    [
                        'id' => 3,
                        'name' => 'Puissance',
                        'type' => 'integer',
                        'unit' => 'W',
                        'value' => 35,
                    ],
                    [
                        'id' => 1,
                        'name' => 'Poids',
                        'type' => 'float',
                        'unit' => 'kg',
                        'value' => 2.2,
                    ],
                ],
                'tags' => [
                    TagsTest::data(1),
                ],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 3,
                'name' => 'PAR64 LED',
                'reference' => 'PAR64LED',
                'description' => 'Projecteur PAR64 à LED, avec son set de gélatines',
                'is_unitary' => false,
                'park_id' => 1,
                'category_id' => 2,
                'sub_category_id' => 3,
                'rental_price' => 3.5,
                'stock_quantity' => 34,
                'out_of_order_quantity' => 4,
                'replacement_price' => 89,
                'is_hidden_on_bill' => false,
                'is_discountable' => true,
                'picture' => null,
                'note' => 'Soyez délicats avec ces projos !',
                'attributes' => [
                    [
                        'id' => 3,
                        'name' => 'Puissance',
                        'type' => 'integer',
                        'unit' => 'W',
                        'value' => 150,
                    ],
                    [
                        'id' => 1,
                        'name' => 'Poids',
                        'type' => 'float',
                        'unit' => 'kg',
                        'value' => 0.85,
                    ],
                ],
                'tags' => [
                    TagsTest::data(1),
                ],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 4,
                'name' => 'Showtec SDS-6',
                'reference' => 'SDS-6-01',
                'description' => "Console DMX (jeu d'orgue) Showtec 6 canaux",
                'is_unitary' => false,
                'park_id' => 1,
                'category_id' => 2,
                'sub_category_id' => 4,
                'rental_price' => 15.95,
                'stock_quantity' => 2,
                'out_of_order_quantity' => null,
                'replacement_price' => 59,
                'is_hidden_on_bill' => false,
                'is_discountable' => true,
                'picture' => null,
                'note' => null,
                'attributes' => [
                    [
                        'id' => 4,
                        'name' => 'Conforme',
                        'type' => 'boolean',
                        'unit' => null,
                        'value' => true,
                    ],
                    [
                        'id' => 3,
                        'name' => 'Puissance',
                        'type' => 'integer',
                        'unit' => 'W',
                        'value' => 60,
                    ],
                    [
                        'id' => 1,
                        'name' => 'Poids',
                        'type' => 'float',
                        'unit' => 'kg',
                        'value' => 3.15,
                    ],
                ],
                'tags' => [],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 5,
                'name' => 'Câble XLR 10m',
                'reference' => 'XLR10',
                'description' => 'Câble audio XLR 10 mètres, mâle-femelle',
                'is_unitary' => false,
                'park_id' => 1,
                'category_id' => 1,
                'sub_category_id' => null,
                'rental_price' => 0.5,
                'stock_quantity' => 40,
                'out_of_order_quantity' => 8,
                'replacement_price' => 9.5,
                'is_hidden_on_bill' => true,
                'is_discountable' => true,
                'picture' => null,
                'note' => null,
                'attributes' => [],
                'tags' => [],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 6,
                'name' => 'Behringer X Air XR18',
                'description' => 'Mélangeur numérique 18 canaux',
                'reference' => 'XR18',
                'is_unitary' => false,
                'park_id' => 1,
                'category_id' => 1,
                'sub_category_id' => 1,
                'rental_price' => 49.99,
                'stock_quantity' => 0,
                'out_of_order_quantity' => 0,
                'replacement_price' => 419,
                'is_hidden_on_bill' => false,
                'is_discountable' => false,
                'picture' => null,
                'note' => null,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
                'tags' => [],
                'attributes' => [
                    [
                        'id' => 5,
                        'name' => "Date d'achat",
                        'type' => 'date',
                        'unit' => null,
                        'value' => '2021-01-28',
                    ],
                ],
            ],
            [
                'id' => 7,
                'name' => 'Volkswagen Transporter',
                'description' => 'Volume utile: 9.3 m3',
                'reference' => 'Transporter',
                'is_unitary' => false,
                'park_id' => 2,
                'category_id' => 3,
                'sub_category_id' => null,
                'rental_price' => 300,
                'stock_quantity' => 1,
                'out_of_order_quantity' => 0,
                'replacement_price' => 32000,
                'is_hidden_on_bill' => false,
                'is_discountable' => false,
                'picture' => null,
                'note' => null,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
                'tags' => [],
                'attributes' => [],
            ],
            [
                'id' => 8,
                'name' => 'Décor Thème Forêt',
                'description' => 'Forêt mystique, typique des récits fantastiques.',
                'reference' => 'Decor-Forest',
                'is_unitary' => false,
                'park_id' => 2,
                'category_id' => 4,
                'sub_category_id' => null,
                'rental_price' => 1500,
                'stock_quantity' => 1,
                'out_of_order_quantity' => 0,
                'replacement_price' => 8500,
                'is_hidden_on_bill' => false,
                'is_discountable' => true,
                'picture' => null,
                'note' => null,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
                'tags' => [],
                'attributes' => [],
            ],
        ]);
    }

    public function testGetAll()
    {
        $this->client->get('/api/materials');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(8, [
            array_replace_recursive(self::data(6), [
                'available_quantity' => 0,
            ]),
            array_replace_recursive(self::data(5), [
                'available_quantity' => 32,
            ]),
            array_replace_recursive(self::data(1), [
                'available_quantity' => 4,
            ]),
            array_replace_recursive(self::data(8), [
                'available_quantity' => 1,
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
                'available_quantity' => 1,
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
        $this->assertEquals(0, $results[0]['stock_quantity']);
        $this->assertEquals(0, $results[0]['available_quantity']);
        $this->assertEquals('Câble XLR 10m', $results[1]['name']);
        $this->assertEquals(40, $results[1]['stock_quantity']);
        $this->assertEquals(32, $results[1]['available_quantity']);

        $this->client->get('/api/materials?deleted=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(0);
    }

    public function testGetAllSearchByName()
    {
        $this->client->get('/api/materials?search=console');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(1);
        $results = $this->_getResponseAsArray();
        $this->assertEquals('CL3', $results['data'][0]['reference']);
    }

    public function testGetAllSearchByReference()
    {
        $this->client->get('/api/materials?search=PA&searchBy=reference');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(2);
        $results = $this->_getResponseAsArray();
        $this->assertEquals('PAR64LED', $results['data'][0]['reference']);
        $this->assertEquals('DBXPA2', $results['data'][1]['reference']);
    }

    public function testGetMaterialNotFound()
    {
        $this->client->get('/api/materials/999');
        $this->assertNotFound();
    }

    public function testGetMaterialsWhileEvent()
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
                'available_quantity' => 1,
            ]),
            array_replace_recursive(self::data(3), [
                'available_quantity' => 30,
            ]),
            array_replace_recursive(self::data(4), [
                'available_quantity' => 2,
            ]),
            array_replace_recursive(self::data(7), [
                'available_quantity' => 1,
            ]),
            array_replace_recursive(self::data(5), [
                'available_quantity' => 32,
            ]),
            array_replace_recursive(self::data(6), [
                'available_quantity' => 0,
            ]),
        ]);
    }

    public function testGetMaterial()
    {
        $this->client->get('/api/materials/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1));
    }

    public function testGetTagsNotFound()
    {
        $this->client->get('/api/materials/999/tags');
        $this->assertNotFound();
    }

    public function testGetTags()
    {
        $this->client->get('/api/materials/1/tags');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            TagsTest::data(1),
        ]);
    }

    public function testGetMaterialsByTagsNotFound()
    {
        $this->client->get('/api/materials?tags[0]=notFound');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'pagination' => [
                'currentPage' => 1,
                'perPage' => $this->settings['maxItemsPerPage'],
                'total' => ['items' => 0, 'pages' => 1],
            ],
            'data' => [],
        ]);
    }

    public function testGetMaterialsByTags()
    {
        $this->client->get('/api/materials?tags[0]=pro');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals([
            'currentPage' => 1,
            'perPage' => $this->settings['maxItemsPerPage'],
            'total' => ['items' => 3, 'pages' => 1],
        ], $response['pagination']);
        $this->assertCount(3, $response['data']);
    }

    public function testGetMaterialsByPark()
    {
        $this->client->get('/api/materials?park=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals([
            'currentPage' => 1,
            'perPage' => $this->settings['maxItemsPerPage'],
            'total' => ['items' => 6, 'pages' => 1],
        ], $response['pagination']);
        $this->assertCount(6, $response['data']);
    }

    public function testGetMaterialsByCategoryAndSubCategory()
    {
        $this->client->get('/api/materials?category=1&subCategory=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals([
            'currentPage' => 1,
            'perPage' => $this->settings['maxItemsPerPage'],
            'total' => ['items' => 2, 'pages' => 1],
        ], $response['pagination']);
        $this->assertCount(2, $response['data']);
    }

    public function testGetMaterialsWithDateForQuantities()
    {
        // - Récupère le matériel avec les quantités qu'il reste pour un jour
        // - pendant lequel se déroulent les événements n°1 et n°2
        $this->client->get('/api/materials?dateForQuantities=2018-12-18');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertCount(8, $response['data']);

        foreach ([0, 32, 0, 1, 30, 0, 1, 1] as $index => $expected) {
            $this->assertArrayHasKey('available_quantity', $response['data'][$index]);
            $this->assertEquals($expected, $response['data'][$index]['available_quantity']);
        }

        // - Récupère le matériel avec les quantités qu'il reste pour une période
        // - pendant laquelle se déroulent les événements n°1, n°2 et n°3
        $this->client->get('/api/materials?dateForQuantities[start]=2018-12-16&dateForQuantities[end]=2018-12-19');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertCount(8, $response['data']);

        foreach ([0, 20, 0, 1, 20, 0, 1, 1] as $index => $expected) {
            $this->assertArrayHasKey('available_quantity', $response['data'][$index]);
            $this->assertEquals($expected, $response['data'][$index]['available_quantity']);
        }

        // - Test avec une période non valide (retourne les quantités en stock uniquement)
        $this->client->get('/api/materials?dateForQuantities[end]=2018-12-18');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertCount(8, $response['data']);

        foreach ([0, 40, 5, 1, 34, 2, 2, 1] as $index => $expected) {
            $this->assertNotContains('available_quantity', $response['data'][$index]);
            $this->assertEquals($expected, $response['data'][$index]['stock_quantity']);
        }
    }

    public function testCreateMaterialWithoutData()
    {
        $this->client->post('/api/materials');
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertErrorMessage("No data was provided.");
    }

    public function testCreateMaterialBadData()
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
        $this->assertValidationError([
            'reference' => [
                "This field is mandatory",
            ],
        ]);
    }

    public function testCreateMaterialDuplicate()
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
        $this->assertValidationError();
    }

    public function testCreateMaterialWithTags()
    {
        $data = [
            'name' => 'Analog Mixing Console Yamaha RM800',
            'reference' => 'RM800',
            'park_id' => 1,
            'category_id' => 1,
            'sub_category_id' => 1,
            'rental_price' => 100.0,
            'replacement_price' => 357.0,
            'stock_quantity' => 1,
            'tags' => ['old matos', 'vintage'],
        ];
        $this->client->post('/api/materials', $data);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 9,
            'name' => 'Analog Mixing Console Yamaha RM800',
            'reference' => 'RM800',
            'is_unitary' => false,
            'park_id' => 1,
            'category_id' => 1,
            'sub_category_id' => 1,
            'rental_price' => 100,
            'replacement_price' => 357,
            'stock_quantity' => 1,
            'out_of_order_quantity' => null,
            'is_hidden_on_bill' => false,
            'is_discountable' => true,
            'description' => null,
            'picture' => null,
            'note' => null,
            'attributes' => [],
            'tags' => [
                ['id' => 2, 'name' => 'old matos'],
                ['id' => 3, 'name' => 'vintage'],
            ],
            'created_at' => '__FAKE_TEST_PLACEHOLDER__',
            'updated_at' => '__FAKE_TEST_PLACEHOLDER__',
            'deleted_at' => null,
        ], ['created_at', 'updated_at']);
    }

    public function testCreateMaterialWithAttributes()
    {
        $data = [
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
        ];
        $this->client->post('/api/materials', $data);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 9,
            'name' => 'Console numérique Yamaha 01V96 V2',
            'reference' => '01V96-v2',
            'is_unitary' => false,
            'park_id' => 1,
            'category_id' => 1,
            'sub_category_id' => 1,
            'rental_price' => 180,
            'replacement_price' => 2000,
            'stock_quantity' => 2,
            'out_of_order_quantity' => null,
            'is_hidden_on_bill' => false,
            'is_discountable' => true,
            'description' => null,
            'picture' => null,
            'note' => null,
            'attributes' => [
                [
                    'id' => 4,
                    'name' => 'Conforme',
                    'type' => 'boolean',
                    'unit' => null,
                    'value' => true,
                ],
                [
                    'id' => 3,
                    'name' => 'Puissance',
                    'type' => 'integer',
                    'unit' => 'W',
                    'value' => 60,
                ],
                [
                    'id' => 1,
                    'name' => 'Poids',
                    'type' => 'float',
                    'unit' => 'kg',
                    'value' => 12.5,
                ],
            ],
            'tags' => [],
            'created_at' => '__FAKE_TEST_PLACEHOLDER__',
            'updated_at' => '__FAKE_TEST_PLACEHOLDER__',
            'deleted_at' => null,
        ], ['created_at', 'updated_at']);
    }

    public function testUpdateMaterial()
    {
        // - Update material #1
        $data = [
            'reference' => 'CL3-v2',
            'stock_quantity' => 6,
        ];
        $this->client->put('/api/materials/1', $data);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals('CL3-v2', $response['reference']);
        $this->assertEquals(6, $response['stock_quantity']);

        // - Test with a negative value for stock quantity
        $data = ['stock_quantity' => -2];
        $this->client->put('/api/materials/1', $data);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(0, $response['stock_quantity']);

        // - Test with an out-of-order quantity higher than stock quantity
        $data = ['stock_quantity' => 5, 'out_of_order_quantity' => 20];
        $this->client->put('/api/materials/1', $data);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(5, $response['stock_quantity']);
        $this->assertEquals(5, $response['out_of_order_quantity']);
    }

    public function testDeleteAndDestroyMaterial()
    {
        // - First call: soft delete.
        $this->client->delete('/api/materials/3');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $softDeleted = Material::withTrashed()->find(3);
        $this->assertNotNull($softDeleted);
        $this->assertNotEmpty($softDeleted->deleted_at);

        // - Second call: actually DESTROY record from DB
        $this->client->delete('/api/materials/3');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $this->assertNull(Material::withTrashed()->find(3));
    }

    public function testRestoreMaterialNotFound()
    {
        $this->client->put('/api/materials/restore/999');
        $this->assertNotFound();
    }

    public function testRestoreMaterial()
    {
        // - First, delete material #3
        $this->client->delete('/api/materials/3');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);

        // - Then, restore material #3
        $this->client->put('/api/materials/restore/3');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertNotNull(Material::find(2));
    }

    public function testGetAllDocuments()
    {
        // - Get all documents of material #1
        $this->client->get('/api/materials/1/documents');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            [
                'id' => 1,
                'name' => 'User-manual.pdf',
                'type' => 'application/pdf',
                'size' => 54681233
            ],
            [
                'id' => 2,
                'name' => 'warranty.pdf',
                'type' => 'application/pdf',
                'size' => 124068
            ]
        ]);

        // - Get all documents of material #2
        $this->client->get('/api/materials/2/documents');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([]);
    }

    public function testGetEvents()
    {
        $this->client->get('/api/materials/1/events');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            [
                'id' => 4,
                'title' => 'Concert X',
                'start_date' => '2019-03-01 00:00:00',
                'end_date' => '2019-04-10 23:59:59',
                'location' => 'Moon',
                'is_confirmed' => false,
                'is_archived' => false,
                'is_return_inventory_done' => false,
                'has_missing_materials' => null,
                'has_not_returned_materials' => null,
                'parks' => [2, 1],
                'pivot' => [
                    'id' => 9,
                    'material_id' => 1,
                    'event_id' => 4,
                    'quantity' => 1,
                ],
            ],
            [
                'id' => 2,
                'title' => 'Second événement',
                'start_date' => '2018-12-18 00:00:00',
                'end_date' => '2018-12-19 23:59:59',
                'location' => 'Lyon',
                'is_confirmed' => false,
                'is_archived' => false,
                'is_return_inventory_done' => true,
                'has_missing_materials' => null,
                'has_not_returned_materials' => true,
                'parks' => [1],
                'pivot' => [
                    'id' => 4,
                    'material_id' => 1,
                    'event_id' => 2,
                    'quantity' => 3,
                ],
            ],
            [
                'id' => 1,
                'title' => 'Premier événement',
                'start_date' => '2018-12-17 00:00:00',
                'end_date' => '2018-12-18 23:59:59',
                'location' => 'Gap',
                'is_confirmed' => false,
                'is_archived' => false,
                'is_return_inventory_done' => true,
                'has_missing_materials' => null,
                'has_not_returned_materials' => false,
                'parks' => [1],
                'pivot' => [
                    'id' => 1,
                    'material_id' => 1,
                    'event_id' => 1,
                    'quantity' => 1,
                ],
            ]
        ]);
    }

    public function testGetAllPdf()
    {
        $responseStream = $this->client->get('/materials/pdf');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertTrue($responseStream->isReadable());
        $this->assertMatchesHtmlSnapshot($responseStream->getContents());
    }
}
