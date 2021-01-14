<?php
namespace Robert2\Tests;

final class EventsTest extends ApiTestCase
{
    public function testGetEvents()
    {
        $this->client->get('/api/events?start=2018-01-01&end=2018-12-31');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'data' => [
                [
                    'id' => 3,
                    'user_id' => 1,
                    'title' => "Avant-premier événement",
                    'description' => null,
                    'reference' => null,
                    'start_date' => "2018-12-15 00:00:00",
                    'end_date' => "2018-12-16 23:59:59",
                    'is_confirmed' => false,
                    'location' => "Brousse",
                    'is_billable' => false,
                    'has_missing_materials' => false,
                    'parks' => [1],
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
                [
                    'id' => 1,
                    'user_id' => 1,
                    'title' => "Premier événement",
                    'description' => null,
                    'reference' => null,
                    'start_date' => "2018-12-17 00:00:00",
                    'end_date' => "2018-12-18 23:59:59",
                    'is_confirmed' => false,
                    'location' => "Gap",
                    'is_billable' => true,
                    'has_missing_materials' => true,
                    'parks' => [1],
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
                [
                    'id' => 2,
                    'user_id' => 1,
                    'title' => "Second événement",
                    'description' => null,
                    'reference' => null,
                    'start_date' => "2018-12-18 00:00:00",
                    'end_date' => "2018-12-19 23:59:59",
                    'is_confirmed' => false,
                    'location' => "Lyon",
                    'is_billable' => true,
                    'has_missing_materials' => true,
                    'parks' => [1],
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                ],
            ]
        ]);

        $this->client->get('/api/events?start=2018-01-01&end=2018-12-31&deleted=1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['data' => []]);
    }

    public function testGetEventNotFound()
    {
        $this->client->get('/api/events/999');
        $this->assertStatusCode(ERROR_NOT_FOUND);
        $this->assertNotFoundErrorMessage();
    }

    public function testGetOneEvent()
    {
        $this->client->get('/api/events/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id'           => 1,
            'user_id'      => 1,
            'title'        => "Premier événement",
            'description'  => null,
            'reference'    => null,
            'start_date'   => "2018-12-17 00:00:00",
            'end_date'     => "2018-12-18 23:59:59",
            'is_confirmed' => false,
            'location'     => "Gap",
            'is_billable'  => true,
            'created_at'   => null,
            'updated_at'   => null,
            'deleted_at'   => null,
            'user'         => [
                'id'       => 1,
                'pseudo'   => 'test1',
                'email'    => 'tester@robertmanager.net',
                'group_id' => 'admin',
                'person'   => [
                    'id'          => 1,
                    'user_id'     => 1,
                    'first_name'  => 'Jean',
                    'last_name'   => 'Fountain',
                    'full_name'   => 'Jean Fountain',
                    'nickname'    => null,
                    'email'       => 'tester@robertmanager.net',
                    'phone'       => null,
                    'street'      => '1, somewhere av.',
                    'postal_code' => '1234',
                    'locality'    => 'Megacity',
                    'country_id'  => 1,
                    'company_id'  => 1,
                    'note'        => null,
                    'created_at'  => null,
                    'updated_at'  => null,
                    'deleted_at'  => null,
                    'company'     => [
                        'id'          => 1,
                        'legal_name'  => 'Testing, Inc',
                        'street'      => '1, company st.',
                        'postal_code' => '1234',
                        'locality'    => 'Megacity',
                        'country_id'  => 1,
                        'phone'       => '+4123456789',
                        'note'        => 'Just for tests',
                        'created_at'  => null,
                        'updated_at'  => null,
                        'deleted_at'  => null,
                        'country'     => [
                            'id'   => 1,
                            'name' => 'France',
                            'code' => 'FR',
                        ],
                    ],
                    'country' => [
                        'id'   => 1,
                        'code' => 'FR',
                        'name' => 'France',
                    ]
                ],
            ],
            'assignees' => [
                [
                    'id'         => 2,
                    'first_name' => 'Roger',
                    'last_name'  => 'Rabbit',
                    'nickname'   => 'Riri',
                    'full_name'  => 'Roger Rabbit',
                    'company'    => null,
                    'country'    => null,
                    'pivot'      => ['event_id' => '1', 'person_id' => '2'],
                ],
                [
                    'id'         => 1,
                    'first_name' => 'Jean',
                    'last_name'  => 'Fountain',
                    'nickname'   => null,
                    'full_name'  => 'Jean Fountain',
                    'company'    => null,
                    'country'    => null,
                    'pivot'      => ['event_id' => '1', 'person_id' => '1'],
                ],
            ],
            'beneficiaries' => [
                [
                    'id'          => 3,
                    'first_name'  => 'Client',
                    'last_name'   => 'Benef',
                    'full_name'   => 'Client Benef',
                    'street'      => '156 bis, avenue des tests poussés',
                    'postal_code' => '88080',
                    'locality'    => 'Wazzaville',
                    'company_id'  => null,
                    'company'     => null,
                    'country'     => null,
                    'pivot'       => ['event_id' => '1', 'person_id' => '3'],
                ],
            ],
            'materials' => [
                [
                    'id'                    => 4,
                    'name'                  => 'Showtec SDS-6',
                    'description'           => "Console DMX (jeu d'orgue) Showtec 6 canaux",
                    'reference'             => 'SDS-6-01',
                    'is_unitary'            => false,
                    'park_id'               => 1,
                    'rental_price'          => 15.95,
                    'stock_quantity'        => 2,
                    'out_of_order_quantity' => null,
                    'replacement_price'     => 59,
                    'is_hidden_on_bill'     => false,
                    'is_discountable'       => true,
                    'category_id'           => 2,
                    'sub_category_id'       => 4,
                    'tags'                  => [],
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
                    'pivot' => ['event_id' => 1, 'material_id' => 4, 'quantity' => 1],
                ],
                [
                    'id'                    => 2,
                    'name'                  => 'Processeur DBX PA2',
                    'description'           => 'Système de diffusion numérique',
                    'reference'             => 'DBXPA2',
                    'is_unitary'            => false,
                    'park_id'               => 1,
                    'rental_price'          => 25.5,
                    'stock_quantity'        => 2,
                    'out_of_order_quantity' => null,
                    'replacement_price'     => 349.9,
                    'is_hidden_on_bill'     => false,
                    'is_discountable'       => true,
                    'category_id'           => 1,
                    'sub_category_id'       => 2,
                    'tags'                  => [
                        ['id' => 3, 'name' => 'pro'],
                    ],
                    'attributes' => [
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
                    'pivot' => ['event_id' => 1, 'material_id' => 2, 'quantity' => 1],
                ],
                [
                    'id'                    => 1,
                    'name'                  => 'Console Yamaha CL3',
                    'description'           => 'Console numérique 64 entrées / 8 sorties + Master + Sub',
                    'reference'             => 'CL3',
                    'is_unitary'            => false,
                    'park_id'               => 1,
                    'rental_price'          => 300,
                    'stock_quantity'        => 5,
                    'out_of_order_quantity' => 1,
                    'replacement_price'     => 19400,
                    'is_hidden_on_bill'     => false,
                    'is_discountable'       => false,
                    'category_id'           => 1,
                    'sub_category_id'       => 1,
                    'tags'                  => [
                        ['id' => 3, 'name' => 'pro'],
                    ],
                    'attributes' => [
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
                    'pivot' => ['event_id' => 1, 'material_id' => 1, 'quantity' => 1],
                ],
            ],
            'bills' => [
                [
                    'id'            => 1,
                    'number'        => '2020-00001',
                    'date'          => '2020-01-30 14:00:00',
                    'discount_rate' => 50.0,
                    'due_amount'    => 325.5,
                ],
            ],
        ]);
    }

    public function testCreateEvent()
    {
        // - Test avec des données simples
        $data = [
            'user_id'      => 1,
            'title'        => "Un nouvel événement",
            'description'  => null,
            'start_date'   => '2019-09-01 00:00:00',
            'end_date'     => '2019-09-03 23:59:59',
            'is_confirmed' => true,
            'location'     => 'Avignon',
        ];
        $this->client->post('/api/events', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(5, $response['id']);
        $this->assertEquals("Un nouvel événement", $response['title']);
        $this->assertEmpty($response['beneficiaries']);
        $this->assertEmpty($response['assignees']);
        $this->assertEmpty($response['materials']);

        // - Test avec des données qui contiennent les sous-entités (hasMany)
        $dataWithChildren = array_merge($data, [
            'title'         => "Encore un événement",
            'beneficiaries' => [3],
            'assignees'     => [1, 2],
            'materials'     => [
                ['id' => 1, 'quantity' => 1],
                ['id' => 2, 'quantity' => 1],
                ['id' => 4, 'quantity' => 2],
            ],
        ]);
        $this->client->post('/api/events', $dataWithChildren);
        $this->assertStatusCode(SUCCESS_CREATED);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(6, $response['id']);
        $this->assertEquals("Encore un événement", $response['title']);
        $this->assertCount(1, $response['beneficiaries']);
        $this->assertCount(2, $response['assignees']);
        $this->assertCount(3, $response['materials']);
        $this->assertEquals(2, $response['materials'][0]['pivot']['quantity']);
    }

    public function testUpdateEventNoData()
    {
        $this->client->put('/api/events/1', []);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertErrorMessage("Missing request data to process validation");
    }

    public function testUpdateEventNotFound()
    {
        $this->client->put('/api/events/999', ['name' => '__inexistant__']);
        $this->assertStatusCode(ERROR_NOT_FOUND);
    }

    public function testUpdateEvent()
    {
        // - Données attendues pour les tests qui suivent
        $expected = [
            'id'      => 1,
            'user_id' => 1,
            'user'    => [
                'id'       => 1,
                'pseudo'   => 'test1',
                'email'    => 'tester@robertmanager.net',
                'group_id' => 'admin',
                'person'   => [
                    'id'          => 1,
                    'user_id'     => 1,
                    'first_name'  => 'Jean',
                    'last_name'   => 'Fountain',
                    'nickname'    => '',
                    'email'       => 'tester@robertmanager.net',
                    'phone'       => '',
                    'street'      => '1, somewhere av.',
                    'postal_code' => '1234',
                    'locality'    => 'Megacity',
                    'country_id'  => 1,
                    'company_id'  => 1,
                    'note'        => null,
                    'created_at'  => null,
                    'updated_at'  => null,
                    'deleted_at'  => null,
                    'full_name'   => 'Jean Fountain',
                    'company'     => [
                        'id'          => 1,
                        'legal_name'  => 'Testing, Inc',
                        'street'      => '1, company st.',
                        'postal_code' => '1234',
                        'locality'    => 'Megacity',
                        'country_id'  => 1,
                        'phone'       => '+4123456789',
                        'note'        => 'Just for tests',
                        'created_at'  => null,
                        'updated_at'  => null,
                        'deleted_at'  => null,
                        'country'     => [
                            'id'   => 1,
                            'name' => 'France',
                            'code' => 'FR',
                        ],
                    ],
                    'country' => [
                        'id'   => 1,
                        'name' => 'France',
                        'code' => 'FR',
                    ],
                ],
            ],
            'title'        => "Premier événement modifié",
            'description'  => null,
            'reference'    => null,
            'start_date'   => '2018-12-17 00:00:00',
            'end_date'     => '2018-12-18 00:00:00',
            'is_confirmed' => true,
            'location'     => 'Gap et Briançon',
            'is_billable'  => false,
            'assignees'    => [
                [
                    'id'         => 2,
                    'first_name' => 'Roger',
                    'last_name'  => 'Rabbit',
                    'nickname'   => 'Riri',
                    'full_name'  => 'Roger Rabbit',
                    'company'    => null,
                    'country'    => null,
                    'pivot'      => [
                        'event_id'  => '1',
                        'person_id' => '2',
                    ],
                ],
                [
                    'id'         => 1,
                    'first_name' => 'Jean',
                    'last_name'  => 'Fountain',
                    'nickname'   => null,
                    'full_name'  => 'Jean Fountain',
                    'company'    => null,
                    'country'    => null,
                    'pivot'      => [
                        'event_id'  => '1',
                        'person_id' => '1',
                    ],
                ],
            ],
            'beneficiaries' => [
                [
                    'id'          => 3,
                    'first_name'  => 'Client',
                    'last_name'   => 'Benef',
                    'full_name'   => 'Client Benef',
                    'street'      => '156 bis, avenue des tests poussés',
                    'postal_code' => '88080',
                    'locality'    => 'Wazzaville',
                    'company_id'  => null,
                    'company'     => null,
                    'country'     => null,
                    'pivot'       => [
                        'event_id'  => '1',
                        'person_id' => '3',
                    ],
                ],
            ],
            'materials' => [
                [
                    'id'                    => 4,
                    'name'                  => 'Showtec SDS-6',
                    'description'           => 'Console DMX (jeu d\'orgue) Showtec 6 canaux',
                    'reference'             => 'SDS-6-01',
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
                    'tags'                  => [],
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
                    'pivot' => [
                        'event_id'    => 1,
                        'material_id' => 4,
                        'quantity'    => 1,
                    ],
                ],
                [
                    'id'                    => 2,
                    'name'                  => 'Processeur DBX PA2',
                    'description'           => 'Système de diffusion numérique',
                    'reference'             => 'DBXPA2',
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
                    'tags'                  => [
                        ['id' => 3, 'name' => 'pro'],
                    ],
                    'attributes' => [
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
                    'pivot' => [
                        'event_id'    => 1,
                        'material_id' => 2,
                        'quantity'    => 1,
                    ],
                ],
                [
                    'id'                    => 1,
                    'name'                  => 'Console Yamaha CL3',
                    'description'           => 'Console numérique 64 entrées / 8 sorties + Master + Sub',
                    'reference'             => 'CL3',
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
                    'tags'                  => [
                        ['id' => 3, 'name' => 'pro'],
                    ],
                    'attributes' => [
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
                    'pivot' => [
                        'event_id'    => 1,
                        'material_id' => 1,
                        'quantity'    => 1,
                    ],
                ],
            ],
            'bills' => [
                [
                    'id'            => 1,
                    'number'        => '2020-00001',
                    'date'          => '2020-01-30 14:00:00',
                    'discount_rate' => 50.0,
                    'due_amount'    => 325.5,
                ],
            ],
            'created_at' => null,
            'updated_at' => 'fakedTestContent',
            'deleted_at' => null,
        ];

        // - Test avec des données simples
        $data = [
            'id'           => 1,
            'user_id'      => 1,
            'title'        => "Premier événement modifié",
            'description'  => null,
            'start_date'   => '2018-12-17 00:00:00',
            'end_date'     => '2018-12-18 00:00:00',
            'is_confirmed' => true,
            'location'     => 'Gap et Briançon',
            'is_billable'  => false,
        ];
        $this->client->put('/api/events/1', $data);
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData($expected, ['updated_at']);

        // - Test avec des données qui contiennent les sous-entités (hasMany)
        $dataWithChildren = array_merge($data, [
            'beneficiaries' => [3],
            'assignees'     => [1, 2],
            'materials'     => [
                ['id' => 1, 'quantity' => 1],
                ['id' => 2, 'quantity' => 1],
                ['id' => 4, 'quantity' => 1],
            ],
        ]);
        $this->client->put('/api/events/1', $dataWithChildren);
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData($expected, ['updated_at']);
    }

    public function testDeleteAndDestroyEvent()
    {
        // - First call : sets `deleted_at` not null
        $this->client->delete('/api/events/1');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertNotEmpty($response['deleted_at']);

        // - Second call : actually DESTROY record from DB
        $this->client->delete('/api/events/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['destroyed' => true]);
    }

    public function testRestoreEventNotFound()
    {
        $this->client->put('/api/events/restore/999');
        $this->assertStatusCode(ERROR_NOT_FOUND);
    }

    public function testRestoreEvent()
    {
        // - First, delete event #1
        $this->client->delete('/api/events/1');
        $this->assertStatusCode(SUCCESS_OK);

        // - Then, restore event #1
        $this->client->put('/api/events/restore/1');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEmpty($response['deleted_at']);
    }

    public function testGetMissingMaterials()
    {
        // - Get missing materials for event #3 (no missing materials)
        $this->client->get('/api/events/3/missing-materials');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([]);

        // - Get missing materials for event #1
        $this->client->get('/api/events/1/missing-materials');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            [
                'id'                    => 2,
                'name'                  => 'Processeur DBX PA2',
                'description'           => 'Système de diffusion numérique',
                'reference'             => 'DBXPA2',
                'is_unitary'            => false,
                'park_id'               => 1,
                'category_id'           => 1,
                'sub_category_id'       => 2,
                'rental_price'          => 25.5,
                'stock_quantity'        => 2,
                'remaining_quantity'    => -1,
                'out_of_order_quantity' => null,
                'replacement_price'     => 349.9,
                'is_hidden_on_bill'     => false,
                'is_discountable'       => true,
                'tags'                  => [
                    ['id' => 3, 'name' => 'pro'],
                ],
                'attributes' => [
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
                'pivot' => [
                    'event_id'    => 1,
                    'material_id' => 2,
                    'quantity'    => 1,
                ],
            ],
        ]);

        // - Event not found
        $this->client->get('/api/events/999/missing-materials');
        $this->assertStatusCode(ERROR_NOT_FOUND);
        $this->assertNotFoundErrorMessage();
    }

    public function testDownloadPdf()
    {
        // - Event does not exists
        $this->client->get('/events/999/pdf');
        $this->assertStatusCode(404);

        // - Download event n°1 PDF file
        $this->client->get('/events/1/pdf');
        $this->assertStatusCode(200);
        $responseStream = $this->client->response->getBody();
        $this->assertTrue($responseStream->isReadable());
    }
}
