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
                'current_page' => 1,
                'from' => 1,
                'last_page' => 1,
                'path' => '/api/materials',
                'first_page_url' => '/api/materials?page=1',
                'next_page_url' => null,
                'prev_page_url' => null,
                'last_page_url' => '/api/materials?page=1',
                'per_page' => $this->settings['maxItemsPerPage'],
                'to' => 8,
                'total' => 8,
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
                    'stock_quantity' => 3,
                    'out_of_order_quantity' => 1,
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
                    'units' => [
                        [
                            'id' => 1,
                            'reference' => 'XR18-1',
                            'serial_number' => null,
                            'park_id' => 1,
                            'is_broken' => false,
                            'is_lost' => false,
                            'material_unit_state_id' => 1,
                            'purchase_date' => '2020-02-01',
                            'notes' => 'Ce bon vieux XR-18',
                            'state' => [
                                'id' => 1,
                                'name' => 'Bon état',
                                'created_at' => null,
                                'updated_at' => null,
                                'deleted_at' => null,
                            ],
                        ],
                        [
                            'id' => 2,
                            'reference' => 'XR18-2',
                            'serial_number' => null,
                            'park_id' => 1,
                            'is_broken' => false,
                            'is_lost' => false,
                            'material_unit_state_id' => 2,
                            'purchase_date' => null,
                            'notes' => null,
                            'state' => [
                                'id' => 2,
                                'name' => 'État médiocre',
                                'created_at' => null,
                                'updated_at' => null,
                                'deleted_at' => null,
                            ],
                        ],
                        [
                            'id' => 3,
                            'reference' => 'XR18-3',
                            'serial_number' => null,
                            'park_id' => 2,
                            'is_broken' => true,
                            'is_lost' => false,
                            'material_unit_state_id' => null,
                            'purchase_date' => null,
                            'notes' => null,
                            'state' => null,
                        ],
                    ],
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
                    'units' => [],
                    'attributes' => [],
                    'tags' => [],
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
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
                    'units' => [],
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
                        ['id' => 3, 'name' => 'pro'],
                    ],
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
                [
                    'id' => 8,
                    'name' => 'Décor Thème Forêt',
                    'description' => 'Forêt mystique, typique des récits fantastiques.',
                    'reference' => 'Decor-Forest',
                    'is_unitary' => true,
                    'park_id' => null,
                    'category_id' => 4,
                    'sub_category_id' => null,
                    'rental_price' => 1500,
                    'stock_quantity' => 2,
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
                    'units' => [
                        [
                            'id' => 5,
                            'reference' => 'DECOR-FOREST-1',
                            'serial_number' => null,
                            'is_broken' => false,
                            'park_id' => 1,
                            'is_lost' => false,
                            'material_unit_state_id' => null,
                            'purchase_date' => null,
                            'notes' => null,
                            'state' => null,
                        ],
                        [
                            'id' => 6,
                            'reference' => 'DECOR-FOREST-2',
                            'serial_number' => null,
                            'is_broken' => false,
                            'park_id' => 1,
                            'is_lost' => false,
                            'material_unit_state_id' => null,
                            'purchase_date' => null,
                            'notes' => 'Attention à la marche !',
                            'state' => null,
                        ],
                    ]
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
                    'units' => [],
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
                        ['id' => 3, 'name' => 'pro'],
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
                    'units' => [],
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
                        ['id' => 3, 'name' => 'pro'],
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
                    'units' => [],
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
                    'id' => 7,
                    'name' => 'Volkswagen Transporter',
                    'description' => 'Volume utile : 9.3 m3',
                    'reference' => 'Transporter',
                    'is_unitary' => true,
                    'park_id' => null,
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
                    'units' => [
                        [
                            'id' => 4,
                            'reference' => 'VHCL-1',
                            'serial_number' => '123456-000789',
                            'is_broken' => false,
                            'park_id' => 2,
                            'is_lost' => false,
                            'material_unit_state_id' => null,
                            'purchase_date' => null,
                            'notes' => null,
                            'state' => null,
                        ]
                    ],
                ],
            ],
        ]);

        $this->client->get('/api/materials?orderBy=reference&ascending=0');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(8, '/api/materials', 'orderBy=reference&ascending=0');
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
        $this->assertNotFound();
    }

    public function testGetMaterialsWhileEvent()
    {
        $this->client->get('/api/materials/while-event/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
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
                'remaining_quantity' => 1,
                'units' => [],
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
                    ['id' => 3, 'name' => 'pro'],
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
                'remaining_quantity' => 0,
                'units' => [],
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
                    ['id' => 3, 'name' => 'pro'],
                ],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 8,
                'name' => 'Décor Thème Forêt',
                'description' => 'Forêt mystique, typique des récits fantastiques.',
                'reference' => 'Decor-Forest',
                'is_unitary' => true,
                'park_id' => null,
                'category_id' => 4,
                'sub_category_id' => null,
                'rental_price' => 1500,
                'stock_quantity' => 2,
                'out_of_order_quantity' => 0,
                'replacement_price' => 8500,
                'is_hidden_on_bill' => false,
                'is_discountable' => true,
                'picture' => null,
                'note' => null,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
                'remaining_quantity' => 2,
                'tags' => [],
                'units' => [
                    [
                        'id' => 5,
                        'reference' => 'DECOR-FOREST-1',
                        'serial_number' => null,
                        'park_id' => 1,
                        'is_broken' => false,
                        'is_lost' => false,
                        'material_unit_state_id' => null,
                        'purchase_date' => null,
                        'notes' => null,
                        'state' => null,
                        'is_available' => true,
                    ],
                    [
                        'id' => 6,
                        'reference' => 'DECOR-FOREST-2',
                        'serial_number' => null,
                        'park_id' => 1,
                        'is_broken' => false,
                        'is_lost' => false,
                        'material_unit_state_id' => null,
                        'purchase_date' => null,
                        'notes' => 'Attention à la marche !',
                        'state' => null,
                        'is_available' => true,
                    ],
                ],
                'attributes' => [],
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
                'remaining_quantity' => 30,
                'units' => [],
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
                    ['id' => 3, 'name' => 'pro'],
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
                'remaining_quantity' => 2,
                'units' => [],
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
                'id' => 7,
                'name' => 'Volkswagen Transporter',
                'description' => 'Volume utile : 9.3 m3',
                'reference' => 'Transporter',
                'is_unitary' => true,
                'park_id' => null,
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
                'remaining_quantity' => 1,
                'units' => [
                    [
                        'id' => 4,
                        'reference' => 'VHCL-1',
                        'serial_number' => '123456-000789',
                        'park_id' => 2,
                        'is_broken' => false,
                        'is_lost' => false,
                        'material_unit_state_id' => null,
                        'purchase_date' => null,
                        'notes' => null,
                        'state' => null,
                        'is_available' => true,
                    ],
                ],
                'attributes' => [],
                'tags' => [],
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
                'remaining_quantity' => 32,
                'units' => [],
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
                'is_unitary' => true,
                'park_id' => null,
                'category_id' => 1,
                'sub_category_id' => 1,
                'rental_price' => 49.99,
                'stock_quantity' => 3,
                'out_of_order_quantity' => 1,
                'replacement_price' => 419,
                'is_hidden_on_bill' => false,
                'is_discountable' => false,
                'picture' => null,
                'note' => null,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
                'remaining_quantity' => 2,
                'units' => [
                    [
                        'id' => 1,
                        'reference' => 'XR18-1',
                        'serial_number' => null,
                        'park_id' => 1,
                        'is_broken' => false,
                        'is_lost' => false,
                        'material_unit_state_id' => 1,
                        'purchase_date' => '2020-02-01',
                        'notes' => 'Ce bon vieux XR-18',
                        'state' => [
                            'id' => 1,
                            'name' => 'Bon état',
                            'created_at' => null,
                            'updated_at' => null,
                            'deleted_at' => null,
                        ],
                        'is_available' => true,
                    ],
                    [
                        'id' => 2,
                        'reference' => 'XR18-2',
                        'serial_number' => null,
                        'park_id' => 1,
                        'is_broken' => false,
                        'is_lost' => false,
                        'material_unit_state_id' => 2,
                        'purchase_date' => null,
                        'notes' => null,
                        'state' => [
                            'id' => 2,
                            'name' => 'État médiocre',
                            'created_at' => null,
                            'updated_at' => null,
                            'deleted_at' => null,
                        ],
                        'is_available' => true,
                    ],
                    [
                        'id' => 3,
                        'reference' => 'XR18-3',
                        'serial_number' => null,
                        'park_id' => 2,
                        'is_broken' => true,
                        'is_lost' => false,
                        'material_unit_state_id' => null,
                        'purchase_date' => null,
                        'notes' => null,
                        'state' => null,
                        'is_available' => true,
                    ],
                ],
                'attributes' => [
                    [
                        'id' => 5,
                        'name' => "Date d'achat",
                        'type' => 'date',
                        'unit' => null,
                        'value' => '2021-01-28',
                    ],
                ],
                'tags' => [],
            ],
        ]);
    }

    public function testGetMaterial()
    {
        $this->client->get('/api/materials/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'name' => 'Console Yamaha CL3',
            'reference' => 'CL3',
            'is_unitary' => false,
            'description' => 'Console numérique 64 entrées / 8 sorties + Master + Sub',
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
            'units' => [],
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
        $this->assertNotFound();
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
                'current_page' => 1,
                'from' => null,
                'last_page' => 1,
                'path' => '/api/materials',
                'first_page_url' => $pagesUrl,
                'next_page_url' => null,
                'prev_page_url' => null,
                'last_page_url' => $pagesUrl,
                'per_page' => $this->settings['maxItemsPerPage'],
                'to' => null,
                'total' => 0,
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
            'current_page' => 1,
            'from' => 1,
            'last_page' => 1,
            'path' => '/api/materials',
            'first_page_url' => $pagesUrl,
            'next_page_url' => null,
            'prev_page_url' => null,
            'last_page_url' => $pagesUrl,
            'per_page' => $this->settings['maxItemsPerPage'],
            'to' => 3,
            'total' => 3,
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
            'current_page' => 1,
            'from' => 1,
            'last_page' => 1,
            'path' => '/api/materials',
            'first_page_url' => $pagesUrl,
            'next_page_url' => null,
            'prev_page_url' => null,
            'last_page_url' => $pagesUrl,
            'per_page' => $this->settings['maxItemsPerPage'],
            'to' => 8,
            'total' => 8,
        ], $response['pagination']);
        $this->assertCount(8, $response['data']);
    }

    public function testGetMaterialsByCategoryAndSubCategory()
    {
        $this->client->get('/api/materials?category=1&subCategory=1');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $pagesUrl = '/api/materials?category=1&subCategory=1&page=1';
        $this->assertEquals([
            'current_page' => 1,
            'from' => 1,
            'last_page' => 1,
            'path' => '/api/materials',
            'first_page_url' => $pagesUrl,
            'next_page_url' => null,
            'prev_page_url' => null,
            'last_page_url' => $pagesUrl,
            'per_page' => $this->settings['maxItemsPerPage'],
            'to' => 2,
            'total' => 2,
        ], $response['pagination']);
        $this->assertCount(2, $response['data']);
    }

    public function testGetMaterialsWithDateForQuantities()
    {
        // - Récupère le matériel avec les quantités qu'il reste pour un jour
        // - pendant lequel se déroulent les événements n°1 et n°2
        $this->client->get('/api/materials?dateForQuantities=2018-12-18');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertCount(8, $response['data']);

        foreach ([2, 32, 3, 2, 30, 1, 1] as $index => $expected) {
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
            'name' => 'Analog Mixing Console Yamaha RM800',
            'reference' => '',
            'park_id' => 1,
            'category_id' => 1,
            'sub_category_id' => 1,
            'rental_price' => 100,
            'stock_quantity' => 1,
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
            'name' => 'Analog Mixing Console Yamaha CL3',
            'reference' => 'CL3',
            'park_id' => 1,
            'category_id' => 1,
            'sub_category_id' => 1,
            'rental_price' => 500,
            'stock_quantity' => 1,
        ]);
        $this->assertStatusCode(ERROR_DUPLICATE);
        $this->assertValidationErrorMessage();
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
        $this->assertStatusCode(SUCCESS_CREATED);
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
            'units' => [],
            'tags' => [
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
        $this->assertStatusCode(SUCCESS_CREATED);
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
            'units' => [],
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
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
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
        $this->assertNotFound();
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

    public function testGetEvents()
    {
        $this->client->get('/api/materials/1/events');
        $this->assertStatusCode(SUCCESS_OK);
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
                    'units' => [],
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
                    'units' => [],
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
                    'units' => [],
                ],
            ]
        ]);
    }

    public function testGetAllPdf()
    {
        $responseStream = $this->client->get('/materials/pdf');
        $this->assertStatusCode(200);
        $this->assertTrue($responseStream->isReadable());
    }
}
