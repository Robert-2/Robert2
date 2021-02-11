<?php
namespace Robert2\Tests;

final class MaterialsTest extends ApiTestCase
{
    public function testGetMaterials()
    {
        $this->client->get('/api/materials');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'pagination' => [
                'current_page'   => 1,
                'from'           => 1,
                'last_page'      => 1,
                'path'           => '/api/materials',
                'first_page_url' => '/api/materials?page=1',
                'next_page_url'  => null,
                'prev_page_url'  => null,
                'last_page_url'  => '/api/materials?page=1',
                'per_page'       => $this->settings['maxItemsPerPage'],
                'to'             => 7,
                'total'          => 7,
            ],
            'data' => [
                [
                    'id' => 6,
                    'name' => 'Behringer X Air XR18',
                    'description' => 'Mélangeur numérique 18 canaux',
                    'reference' => 'XR18',
                    'is_unitary' => true,
                    'park_id' => null,
                    'category_id' => 1,
                    'sub_category_id' => 1,
                    'rental_price' => 49.99,
                    'stock_quantity' => 0,
                    'out_of_order_quantity' => 0,
                    'replacement_price' => 419,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => false,
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
                    'id'                    => 5,
                    'name'                  => 'Câble XLR 10m',
                    'reference'             => 'XLR10',
                    'description'           => 'Câble audio XLR 10 mètres, mâle-femelle',
                    'is_unitary'            => false,
                    'park_id'               => 1,
                    'category_id'           => 1,
                    'sub_category_id'       => null,
                    'rental_price'          => 0.5,
                    'stock_quantity'        => 40,
                    'out_of_order_quantity' => 8,
                    'replacement_price'     => 9.5,
                    'is_hidden_on_bill'     => true,
                    'is_discountable'       => true,
                    'note'                  => null,
                    'attributes'            => [],
                    'tags'                  => [],
                    'created_at'            => null,
                    'updated_at'            => null,
                    'deleted_at'            => null,
                ],
                [
                    'id'                    => 1,
                    'name'                  => 'Console Yamaha CL3',
                    'reference'             => 'CL3',
                    'description'           => 'Console numérique 64 entrées / 8 sorties + Master + Sub',
                    'is_unitary'            => false,
                    'park_id'               => 1,
                    'category_id'           => 1,
                    'sub_category_id'       => 1,
                    'rental_price'          => 300,
                    'stock_quantity'        => 5,
                    'out_of_order_quantity' => 1,
                    'replacement_price'     => 19400,
                    'is_hidden_on_bill'     => false,
                    'is_discountable'       => false,
                    'note'                  => null,
                    'attributes'            => [
                        [
                            'id'    => 3,
                            'name'  => 'Puissance',
                            'type'  => 'integer',
                            'unit'  => 'W',
                            'value' => 850,
                        ],
                        [
                            'id'    => 2,
                            'name'  => 'Couleur',
                            'type'  => 'string',
                            'unit'  => null,
                            'value' => 'Grise',
                        ],
                        [
                            'id'    => 1,
                            'name'  => 'Poids',
                            'type'  => 'float',
                            'unit'  => 'kg',
                            'value' => 36.5,
                        ],
                    ],
                    'tags' => [
                        ['id' => 3, 'name' => 'pro'],
                    ],
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
                [
                    'id'                    => 3,
                    'name'                  => 'PAR64 LED',
                    'reference'             => 'PAR64LED',
                    'description'           => 'Projecteur PAR64 à LED, avec son set de gélatines',
                    'is_unitary'            => false,
                    'park_id'               => 1,
                    'category_id'           => 2,
                    'sub_category_id'       => 3,
                    'rental_price'          => 3.5,
                    'stock_quantity'        => 34,
                    'out_of_order_quantity' => 4,
                    'replacement_price'     => 89,
                    'is_hidden_on_bill'     => false,
                    'is_discountable'       => true,
                    'note'                  => 'Soyez délicats avec ces projos !',
                    'attributes'            => [
                        [
                            'id'    => 3,
                            'name'  => 'Puissance',
                            'type'  => 'integer',
                            'unit'  => 'W',
                            'value' => 150,
                        ],
                        [
                            'id'    => 1,
                            'name'  => 'Poids',
                            'type'  => 'float',
                            'unit'  => 'kg',
                            'value' => 0.85,
                        ],
                    ],
                    'tags' => [
                        ['id' => 3, 'name' => 'pro'],
                    ],
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
                [
                    'id'                    => 2,
                    'name'                  => 'Processeur DBX PA2',
                    'reference'             => 'DBXPA2',
                    'description'           => 'Système de diffusion numérique',
                    'is_unitary'            => false,
                    'park_id'               => 1,
                    'category_id'           => 1,
                    'sub_category_id'       => 2,
                    'rental_price'          => 25.5,
                    'stock_quantity'        => 2,
                    'out_of_order_quantity' => null,
                    'replacement_price'     => 349.9,
                    'is_hidden_on_bill'     => false,
                    'is_discountable'       => true,
                    'note'                  => null,
                    'attributes'            => [
                        [
                            'id'    => 3,
                            'name'  => 'Puissance',
                            'type'  => 'integer',
                            'unit'  => 'W',
                            'value' => 35,
                        ],
                        [
                            'id'    => 1,
                            'name'  => 'Poids',
                            'type'  => 'float',
                            'unit'  => 'kg',
                            'value' => 2.2,
                        ],
                    ],
                    'tags' => [
                        ['id' => 3, 'name' => 'pro'],
                    ],
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
                [
                    'id'                    => 4,
                    'name'                  => 'Showtec SDS-6',
                    'reference'             => 'SDS-6-01',
                    'description'           => "Console DMX (jeu d'orgue) Showtec 6 canaux",
                    'is_unitary'            => false,
                    'park_id'               => 1,
                    'category_id'           => 2,
                    'sub_category_id'       => 4,
                    'rental_price'          => 15.95,
                    'stock_quantity'        => 2,
                    'out_of_order_quantity' => null,
                    'replacement_price'     => 59,
                    'is_hidden_on_bill'     => false,
                    'is_discountable'       => true,
                    'note'                  => null,
                    'attributes'            => [
                        [
                            'id'    => 4,
                            'name'  => 'Conforme',
                            'type'  => 'boolean',
                            'unit'  => null,
                            'value' => true,
                        ],
                        [
                            'id'    => 3,
                            'name'  => 'Puissance',
                            'type'  => 'integer',
                            'unit'  => 'W',
                            'value' => 60,
                        ],
                        [
                            'id'    => 1,
                            'name'  => 'Poids',
                            'type'  => 'float',
                            'unit'  => 'kg',
                            'value' => 3.15,
                        ],
                    ],
                    'tags'       => [],
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
                [
                    'id'                    => 7,
                    'name'                  => 'Volkswagen Transporter',
                    'description'           => 'Volume utile : 9.3 m3',
                    'reference'             => 'Transporter',
                    'is_unitary'            => true,
                    'park_id'               => null,
                    'category_id'           => 3,
                    'sub_category_id'       => null,
                    'rental_price'          => 300,
                    'stock_quantity'        => 0,
                    'out_of_order_quantity' => 0,
                    'replacement_price'     => 32000,
                    'is_hidden_on_bill'     => false,
                    'is_discountable'       => false,
                    'note'                  => null,
                    'created_at'            => null,
                    'updated_at'            => null,
                    'deleted_at'            => null,
                    'tags'                  => [],
                    'attributes'            => [],
                ],
            ],
        ]);

        $this->client->get('/api/materials?orderBy=reference&ascending=0');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(7, '/api/materials', 'orderBy=reference&ascending=0');
        $results = $this->_getResponseAsArray();

        $expectedResults = [
            'XR18',
            'XLR10',
            'Transporter',
            'SDS-6-01',
            'PAR64LED',
            'DBXPA2',
            'CL3',
        ];
        foreach ($expectedResults as $index => $expected) {
            $this->assertEquals($expected, $results['data'][$index]['reference']);
        }

        $this->client->get('/api/materials?deleted=1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(0, '/api/materials', 'deleted=1');
    }

    public function testGetMaterialsSearchByName()
    {
        $this->client->get('/api/materials?search=console');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(1, '/api/materials', 'search=console');
        $results = $this->_getResponseAsArray();
        $this->assertEquals('CL3', $results['data'][0]['reference']);
    }

    public function testGetMaterialsSearchByReference()
    {
        $this->client->get('/api/materials?search=PA&searchBy=reference');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(2, '/api/materials', 'search=PA&searchBy=reference');
        $results = $this->_getResponseAsArray();
        $this->assertEquals('PAR64LED', $results['data'][0]['reference']);
        $this->assertEquals('DBXPA2', $results['data'][1]['reference']);
    }

    public function testGetMaterialNotFound()
    {
        $this->client->get('/api/materials/999');
        $this->assertStatusCode(ERROR_NOT_FOUND);
        $this->assertNotFoundErrorMessage();
    }

    public function testGetMaterial()
    {
        $this->client->get('/api/materials/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id'                    => 1,
            'name'                  => 'Console Yamaha CL3',
            'reference'             => 'CL3',
            'is_unitary'            => false,
            'description'           => 'Console numérique 64 entrées / 8 sorties + Master + Sub',
            'park_id'               => 1,
            'category_id'           => 1,
            'sub_category_id'       => 1,
            'rental_price'          => 300,
            'stock_quantity'        => 5,
            'out_of_order_quantity' => 1,
            'replacement_price'     => 19400,
            'is_hidden_on_bill'     => false,
            'is_discountable'       => false,
            'note'                  => null,
            'attributes'            => [
                [
                    'id'    => 3,
                    'name'  => 'Puissance',
                    'type'  => 'integer',
                    'unit'  => 'W',
                    'value' => 850,
                ],
                [
                    'id'    => 2,
                    'name'  => 'Couleur',
                    'type'  => 'string',
                    'unit'  => null,
                    'value' => 'Grise',
                ],
                [
                    'id'    => 1,
                    'name'  => 'Poids',
                    'type'  => 'float',
                    'unit'  => 'kg',
                    'value' => 36.5,
                ],
            ],
            'tags' => [
                ['id' => 3, 'name' => 'pro'],
            ],
            'created_at' => null,
            'updated_at' => null,
            'deleted_at' => null
        ]);
    }

    public function testGetTagsNotFound()
    {
        $this->client->get('/api/materials/999/tags');
        $this->assertStatusCode(ERROR_NOT_FOUND);
        $this->assertNotFoundErrorMessage();
    }

    public function testGetTags()
    {
        $this->client->get('/api/materials/1/tags');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            ['id' => 3, 'name' => 'pro'],
        ]);
    }

    public function testGetMaterialsByTagsNotFound()
    {
        $this->client->get('/api/materials?tags[0]=notFound');
        $this->assertStatusCode(SUCCESS_OK);
        $pagesUrl = '/api/materials?tags%5B0%5D=notFound&page=1';
        $this->assertResponseData([
            'pagination' => [
                'current_page'   => 1,
                'from'           => null,
                'last_page'      => 1,
                'path'           => '/api/materials',
                'first_page_url' => $pagesUrl,
                'next_page_url'  => null,
                'prev_page_url'  => null,
                'last_page_url'  => $pagesUrl,
                'per_page'       => $this->settings['maxItemsPerPage'],
                'to'             => null,
                'total'          => 0,
            ],
            'data' => [],
        ]);
    }

    public function testGetMaterialsByTags()
    {
        $this->client->get('/api/materials?tags[0]=pro');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $pagesUrl = '/api/materials?tags%5B0%5D=pro&page=1';
        $this->assertEquals([
            'current_page'   => 1,
            'from'           => 1,
            'last_page'      => 1,
            'path'           => '/api/materials',
            'first_page_url' => $pagesUrl,
            'next_page_url'  => null,
            'prev_page_url'  => null,
            'last_page_url'  => $pagesUrl,
            'per_page'       => $this->settings['maxItemsPerPage'],
            'to'             => 3,
            'total'          => 3,
        ], $response['pagination']);
        $this->assertCount(3, $response['data']);
    }

    public function testGetMaterialsByPark()
    {
        $this->client->get('/api/materials?parkId=1');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $pagesUrl = '/api/materials?parkId=1&page=1';
        $this->assertEquals([
            'current_page'   => 1,
            'from'           => 1,
            'last_page'      => 1,
            'path'           => '/api/materials',
            'first_page_url' => $pagesUrl,
            'next_page_url'  => null,
            'prev_page_url'  => null,
            'last_page_url'  => $pagesUrl,
            'per_page'       => $this->settings['maxItemsPerPage'],
            'to'             => 7,
            'total'          => 7,
        ], $response['pagination']);
        $this->assertCount(7, $response['data']);
    }

    public function testGetMaterialsByCategoryAndSubCategory()
    {
        $this->client->get('/api/materials?category=1&subCategory=1');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $pagesUrl = '/api/materials?category=1&subCategory=1&page=1';
        $this->assertEquals([
            'current_page'   => 1,
            'from'           => 1,
            'last_page'      => 1,
            'path'           => '/api/materials',
            'first_page_url' => $pagesUrl,
            'next_page_url'  => null,
            'prev_page_url'  => null,
            'last_page_url'  => $pagesUrl,
            'per_page'       => $this->settings['maxItemsPerPage'],
            'to'             => 2,
            'total'          => 2,
        ], $response['pagination']);
        $this->assertCount(2, $response['data']);
    }

    public function testGetMaterialsWhileEvent()
    {
        // - Récupère le matériel avec les quantités qu'il reste pour la période
        // - à laquelle se déroule l'événement n°1
        $this->client->get('/api/materials?whileEvent=1');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertCount(7, $response['data']);

        foreach ([0, 32, 1, 30, 0, 2, 0] as $index => $expected) {
            $this->assertEquals($expected, $response['data'][$index]['remaining_quantity']);
        }
    }

    public function testCreateMaterialWithoutData()
    {
        $this->client->post('/api/materials');
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertErrorMessage("Missing request data to process validation");
    }

    public function testCreateMaterialBadData()
    {
        $this->client->post('/api/materials', [
            'name'            => 'Analog Mixing Console Yamaha RM800',
            'reference'       => '',
            'park_id'         => 1,
            'category_id'     => 1,
            'sub_category_id' => 1,
            'rental_price'    => 100,
            'stock_quantity'  => 1,
        ]);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'reference' => [
                "reference must not be empty",
                'reference must contain only letters (a-z), digits (0-9) and ".,-+/_ "',
                "reference must have a length between 2 and 64",
            ],
        ]);
    }

    public function testCreateMaterialDuplicate()
    {
        $this->client->post('/api/materials', [
            'name'            => 'Analog Mixing Console Yamaha CL3',
            'reference'       => 'CL3',
            'park_id'         => 1,
            'category_id'     => 1,
            'sub_category_id' => 1,
            'rental_price'    => 500,
            'stock_quantity'  => 1,
        ]);
        $this->assertStatusCode(ERROR_DUPLICATE);
        $this->assertValidationErrorMessage();
    }

    public function testCreateMaterialWithTags()
    {
        $data = [
            'name'              => 'Analog Mixing Console Yamaha RM800',
            'reference'         => 'RM800',
            'park_id'           => 1,
            'category_id'       => 1,
            'sub_category_id'   => 1,
            'rental_price'      => 100.0,
            'replacement_price' => 357.0,
            'stock_quantity'    => 1,
            'tags'              => ['old matos', 'vintage'],
        ];
        $this->client->post('/api/materials', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id'                    => 8,
            'name'                  => 'Analog Mixing Console Yamaha RM800',
            'reference'             => 'RM800',
            'is_unitary'            => false,
            'park_id'               => 1,
            'category_id'           => 1,
            'sub_category_id'       => 1,
            'rental_price'          => 100,
            'replacement_price'     => 357,
            'stock_quantity'        => 1,
            'out_of_order_quantity' => null,
            'is_hidden_on_bill'     => false,
            'is_discountable'       => true,
            'description'           => null,
            'note'                  => null,
            'attributes'            => [],
            'tags'                  => [
                ['id' => 4, 'name' => 'old matos'],
                ['id' => 5, 'name' => 'vintage'],
            ],
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
            'deleted_at' => null,
        ], ['created_at', 'updated_at']);
    }

    public function testCreateMaterialWithAttributes()
    {
        $data = [
            'name'              => 'Console numérique Yamaha 01V96 V2',
            'reference'         => '01V96-v2',
            'park_id'           => 1,
            'category_id'       => 1,
            'sub_category_id'   => 1,
            'rental_price'      => 180.0,
            'replacement_price' => 2000.0,
            'stock_quantity'    => 2,
            'attributes'        => [
                ['id' => 1, 'value' => 12.5],
                ['id' => 3, 'value' => 60],
                ['id' => 4, 'value' => 'true'],
            ],
        ];
        $this->client->post('/api/materials', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id'                    => 8,
            'name'                  => 'Console numérique Yamaha 01V96 V2',
            'reference'             => '01V96-v2',
            'is_unitary'            => false,
            'park_id'               => 1,
            'category_id'           => 1,
            'sub_category_id'       => 1,
            'rental_price'          => 180,
            'replacement_price'     => 2000,
            'stock_quantity'        => 2,
            'out_of_order_quantity' => null,
            'is_hidden_on_bill'     => false,
            'is_discountable'       => true,
            'description'           => null,
            'note'                  => null,
            'attributes'            => [
                [
                    'id'    => 4,
                    'name'  => 'Conforme',
                    'type'  => 'boolean',
                    'unit'  => null,
                    'value' => true,
                ],
                [
                    'id'    => 3,
                    'name'  => 'Puissance',
                    'type'  => 'integer',
                    'unit'  => 'W',
                    'value' => 60,
                ],
                [
                    'id'    => 1,
                    'name'  => 'Poids',
                    'type'  => 'float',
                    'unit'  => 'kg',
                    'value' => 12.5,
                ],
            ],
            'tags'       => [],
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
            'deleted_at' => null,
        ], ['created_at', 'updated_at']);
    }

    public function testUpdateMaterial()
    {
        // - Update material #1
        $data = [
            'reference'      => 'CL3-v2',
            'stock_quantity' => 6,
        ];
        $this->client->put('/api/materials/1', $data);
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals('CL3-v2', $response['reference']);
        $this->assertEquals(6, $response['stock_quantity']);

        // - Test with a negative value for stock quantity
        $data = ['stock_quantity' => -2];
        $this->client->put('/api/materials/1', $data);
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(0, $response['stock_quantity']);

        // - Test with an out-of-order quantity higher than stock quantity
        $data = ['stock_quantity' => 5, 'out_of_order_quantity' => 20];
        $this->client->put('/api/materials/1', $data);
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(5, $response['stock_quantity']);
        $this->assertEquals(5, $response['out_of_order_quantity']);
    }

    public function testDeleteAndDestroyMaterial()
    {
        // - First call : sets `deleted_at` not null
        $this->client->delete('/api/materials/3');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertNotEmpty($response['deleted_at']);

        // - Second call : actually DESTROY record from DB
        $this->client->delete('/api/materials/3');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['destroyed' => true]);
    }

    public function testRestoreMaterialNotFound()
    {
        $this->client->put('/api/materials/restore/999');
        $this->assertStatusCode(ERROR_NOT_FOUND);
    }

    public function testRestoreMaterial()
    {
        // - First, delete material #3
        $this->client->delete('/api/materials/3');
        $this->assertStatusCode(SUCCESS_OK);

        // - Then, restore material #3
        $this->client->put('/api/materials/restore/3');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEmpty($response['deleted_at']);
    }

    public function testGetAllDocuments()
    {
        // - Get all documents of material #1
        $this->client->get('/api/materials/1/documents');
        $this->assertStatusCode(SUCCESS_OK);
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
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([]);
    }
}
