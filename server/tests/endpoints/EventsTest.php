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
                    'is_archived' => true,
                    'location' => "Brousse",
                    'is_billable' => false,
                    'is_return_inventory_done' => false,
                    'has_missing_materials' => null,
                    'has_not_returned_materials' => null,
                    'parks' => [1],
                    'beneficiaries' => [],
                    'technicians' => [],
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
                    'is_archived' => false,
                    'location' => "Gap",
                    'is_billable' => true,
                    'is_return_inventory_done' => true,
                    'has_missing_materials' => null,
                    'has_not_returned_materials' => false,
                    'parks' => [1],
                    'beneficiaries' => [
                        [
                            'id' => 3,
                            'first_name' => 'Client',
                            'last_name' => 'Benef',
                            'full_name' => 'Client Benef',
                            'country' => null,
                            'company' => null,
                            'pivot' => [
                                'event_id' => 1,
                                'person_id' => 3,
                            ],
                        ],
                    ],
                    'technicians' => [
                        [
                            'id' => 1,
                            'event_id' => 1,
                            'technician_id' => 1,
                            'start_time' => '2018-12-17 09:00:00',
                            'end_time' => '2018-12-18 22:00:00',
                            'position' => 'Régisseur',
                            'technician' => [
                                'id' => 1,
                                'first_name' => 'Jean',
                                'last_name' => 'Fountain',
                                'full_name' => 'Jean Fountain',
                                'nickname' => null,
                                'phone' => null,
                                'country' => null,
                                'company' => null,
                            ],
                        ],
                        [
                            'id' => 2,
                            'event_id' => 1,
                            'technician_id' => 2,
                            'start_time' => '2018-12-18 14:00:00',
                            'end_time' => '2018-12-18 18:00:00',
                            'position' => 'Technicien plateau',
                            'technician' => [
                                'id' => 2,
                                'first_name' => 'Roger',
                                'last_name' => 'Rabbit',
                                'full_name' => 'Roger Rabbit',
                                'nickname' => 'Riri',
                                'phone' => null,
                                'country' => null,
                                'company' => null,
                            ],
                        ],
                    ],
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
                    'is_archived' => false,
                    'location' => "Lyon",
                    'is_billable' => true,
                    'is_return_inventory_done' => true,
                    'has_missing_materials' => null,
                    'has_not_returned_materials' => true,
                    'parks' => [1],
                    'beneficiaries' => [
                        [
                            'id' => 3,
                            'first_name' => 'Client',
                            'last_name' => 'Benef',
                            'full_name' => 'Client Benef',
                            'country' => null,
                            'company' => null,
                            'pivot' => [
                                'event_id' => 2,
                                'person_id' => 3,
                            ],
                        ],
                    ],
                    'technicians' => [],
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
        $this->assertNotFound();
    }

    public function testGetOneEvent()
    {
        $this->client->get('/api/events/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'user_id' => 1,
            'title' => "Premier événement",
            'description' => null,
            'reference' => null,
            'start_date' => "2018-12-17 00:00:00",
            'end_date' => "2018-12-18 23:59:59",
            'is_confirmed' => false,
            'is_archived' => false,
            'location' => "Gap",
            'is_billable' => true,
            'is_return_inventory_done' => true,
            'has_missing_materials' => null,
            'has_not_returned_materials' => false,
            'created_at' => null,
            'updated_at' => null,
            'deleted_at' => null,
            'user' => [
                'id' => 1,
                'pseudo' => 'test1',
                'email' => 'tester@robertmanager.net',
                'group_id' => 'admin',
                'person' => [
                    'id' => 1,
                    'user_id' => 1,
                    'first_name' => 'Jean',
                    'last_name' => 'Fountain',
                    'full_name' => 'Jean Fountain',
                    'reference' => '0001',
                    'nickname' => null,
                    'email' => 'tester@robertmanager.net',
                    'phone' => null,
                    'street' => '1, somewhere av.',
                    'postal_code' => '1234',
                    'locality' => 'Megacity',
                    'country_id' => 1,
                    'company_id' => 1,
                    'note' => null,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                    'company' => [
                        'id' => 1,
                        'legal_name' => 'Testing, Inc',
                        'street' => '1, company st.',
                        'postal_code' => '1234',
                        'locality' => 'Megacity',
                        'country_id' => 1,
                        'phone' => '+4123456789',
                        'note' => 'Just for tests',
                        'created_at' => null,
                        'updated_at' => null,
                        'deleted_at' => null,
                        'country' => [
                            'id' => 1,
                            'name' => 'France',
                            'code' => 'FR',
                        ],
                    ],
                    'country' => [
                        'id' => 1,
                        'code' => 'FR',
                        'name' => 'France',
                    ]
                ],
            ],
            'technicians' => [
                [
                    'id' => 1,
                    'event_id' => 1,
                    'technician_id' => 1,
                    'start_time' => '2018-12-17 09:00:00',
                    'end_time' => '2018-12-18 22:00:00',
                    'position' => 'Régisseur',
                    'technician' => [
                        'id' => 1,
                        'first_name' => 'Jean',
                        'last_name' => 'Fountain',
                        'nickname' => null,
                        'full_name' => 'Jean Fountain',
                        'phone' => null,
                        'company' => null,
                        'country' => null,
                    ],
                ],
                [
                    'id' => 2,
                    'event_id' => 1,
                    'technician_id' => 2,
                    'start_time' => '2018-12-18 14:00:00',
                    'end_time' => '2018-12-18 18:00:00',
                    'position' => 'Technicien plateau',
                    'technician' => [
                        'id' => 2,
                        'first_name' => 'Roger',
                        'last_name' => 'Rabbit',
                        'nickname' => 'Riri',
                        'full_name' => 'Roger Rabbit',
                        'phone' => null,
                        'company' => null,
                        'country' => null,
                    ],
                ],
            ],
            'beneficiaries' => [
                [
                    'id' => 3,
                    'first_name' => 'Client',
                    'last_name' => 'Benef',
                    'full_name' => 'Client Benef',
                    'reference' => null,
                    'phone' => '+33123456789',
                    'street' => '156 bis, avenue des tests poussés',
                    'postal_code' => '88080',
                    'locality' => 'Wazzaville',
                    'company_id' => null,
                    'company' => null,
                    'country' => null,
                    'pivot' => ['event_id' => '1', 'person_id' => '3'],
                ],
            ],
            'materials' => [
                [
                    'id' => 4,
                    'name' => 'Showtec SDS-6',
                    'description' => "Console DMX (jeu d'orgue) Showtec 6 canaux",
                    'reference' => 'SDS-6-01',
                    'is_unitary' => false,
                    'park_id' => 1,
                    'rental_price' => 15.95,
                    'stock_quantity' => 2,
                    'out_of_order_quantity' => null,
                    'replacement_price' => 59,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => true,
                    'category_id' => 2,
                    'sub_category_id' => 4,
                    'tags' => [],
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
                    'pivot' => [
                        'id' => 3,
                        'event_id' => 1,
                        'material_id' => 4,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_broken' => 1,
                    ],
                ],
                [
                    'id' => 2,
                    'name' => 'Processeur DBX PA2',
                    'description' => 'Système de diffusion numérique',
                    'reference' => 'DBXPA2',
                    'is_unitary' => false,
                    'park_id' => 1,
                    'rental_price' => 25.5,
                    'stock_quantity' => 2,
                    'out_of_order_quantity' => null,
                    'replacement_price' => 349.9,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => true,
                    'category_id' => 1,
                    'sub_category_id' => 2,
                    'tags' => [
                        ['id' => 3, 'name' => 'pro'],
                    ],
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
                    'pivot' => [
                        'id' => 2,
                        'event_id' => 1,
                        'material_id' => 2,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_broken' => 0,
                    ],
                ],
                [
                    'id' => 1,
                    'name' => 'Console Yamaha CL3',
                    'description' => 'Console numérique 64 entrées / 8 sorties + Master + Sub',
                    'reference' => 'CL3',
                    'is_unitary' => false,
                    'park_id' => 1,
                    'rental_price' => 300,
                    'stock_quantity' => 5,
                    'out_of_order_quantity' => 1,
                    'replacement_price' => 19400,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => false,
                    'category_id' => 1,
                    'sub_category_id' => 1,
                    'tags' => [
                        ['id' => 3, 'name' => 'pro'],
                    ],
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
                    'pivot' => [
                        'id' => 1,
                        'event_id' => 1,
                        'material_id' => 1,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_broken' => 0,
                    ],
                ],
            ],
            'bills' => [
                [
                    'id' => 1,
                    'number' => '2020-00001',
                    'date' => '2020-01-30 14:00:00',
                    'discount_rate' => 50.0,
                    'due_amount' => 325.5,
                ],
            ],
            'estimates' => [
                [
                    'id' => 1,
                    'date' => '2021-01-30 14:00:00',
                    'discount_rate' => 50.0,
                    'due_amount' => 325.5,
                ],
            ],
        ]);
    }

    public function testCreateEvent()
    {
        // - Test avec des données simples
        $data = [
            'user_id' => 1,
            'title' => "Un nouvel événement",
            'description' => null,
            'start_date' => '2019-09-01 00:00:00',
            'end_date' => '2019-09-03 23:59:59',
            'is_confirmed' => true,
            'is_archived' => false,
            'location' => 'Avignon',
        ];
        $this->client->post('/api/events', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(7, $response['id']);
        $this->assertEquals("Un nouvel événement", $response['title']);
        $this->assertEmpty($response['beneficiaries']);
        $this->assertEmpty($response['technicians']);
        $this->assertEmpty($response['materials']);

        // - Test avec des données qui contiennent les sous-entités (hasMany)
        $dataWithChildren = array_merge($data, [
            'title' => "Encore un événement",
            'beneficiaries' => [3],
            'technicians' => [
                [
                    'id' => 1,
                    'start_time' => '2019-09-01 10:00:00',
                    'end_time' => '2019-09-03 20:00:00',
                    'position' => 'Régie générale',
                ],
                [
                    'id' => 2,
                    'start_time' => '2019-09-01 08:00:00',
                    'end_time' => '2019-09-03 22:00:00',
                    'position' => null,
                ],
            ],
            'materials' => [
                ['id' => 1, 'quantity' => 1],
                ['id' => 2, 'quantity' => 1],
                ['id' => 4, 'quantity' => 2],
            ],
        ]);
        $this->client->post('/api/events', $dataWithChildren);
        $this->assertStatusCode(SUCCESS_CREATED);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(8, $response['id']);
        $this->assertEquals("Encore un événement", $response['title']);
        $this->assertCount(1, $response['beneficiaries']);
        $this->assertCount(2, $response['technicians']);
        $this->assertNull($response['technicians'][0]['position']);
        $this->assertEquals('Régie générale', $response['technicians'][1]['position']);
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
        $this->assertNotFound();
    }

    public function testUpdateEvent()
    {
        // - Données attendues pour les tests qui suivent
        $expected = [
            'id' => 1,
            'user_id' => 1,
            'user' => [
                'id' => 1,
                'pseudo' => 'test1',
                'email' => 'tester@robertmanager.net',
                'group_id' => 'admin',
                'person' => [
                    'id' => 1,
                    'user_id' => 1,
                    'first_name' => 'Jean',
                    'last_name' => 'Fountain',
                    'reference' => '0001',
                    'nickname' => '',
                    'email' => 'tester@robertmanager.net',
                    'phone' => '',
                    'street' => '1, somewhere av.',
                    'postal_code' => '1234',
                    'locality' => 'Megacity',
                    'country_id' => 1,
                    'company_id' => 1,
                    'note' => null,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                    'full_name' => 'Jean Fountain',
                    'company' => [
                        'id' => 1,
                        'legal_name' => 'Testing, Inc',
                        'street' => '1, company st.',
                        'postal_code' => '1234',
                        'locality' => 'Megacity',
                        'country_id' => 1,
                        'phone' => '+4123456789',
                        'note' => 'Just for tests',
                        'created_at' => null,
                        'updated_at' => null,
                        'deleted_at' => null,
                        'country' => [
                            'id' => 1,
                            'name' => 'France',
                            'code' => 'FR',
                        ],
                    ],
                    'country' => [
                        'id' => 1,
                        'name' => 'France',
                        'code' => 'FR',
                    ],
                ],
            ],
            'title' => "Premier événement modifié",
            'description' => null,
            'reference' => null,
            'start_date' => '2018-12-17 00:00:00',
            'end_date' => '2018-12-18 23:59:59',
            'is_confirmed' => true,
            'is_archived' => false,
            'location' => 'Gap et Briançon',
            'is_billable' => false,
            'is_return_inventory_done' => true,
            'technicians' => [
                [
                    'id' => 1,
                    'event_id' => 1,
                    'technician_id' => 1,
                    'start_time' => '2018-12-17 09:00:00',
                    'end_time' => '2018-12-18 22:00:00',
                    'position' => 'Régisseur',
                    'technician' => [
                        'id' => 1,
                        'first_name' => 'Jean',
                        'last_name' => 'Fountain',
                        'nickname' => null,
                        'full_name' => 'Jean Fountain',
                        'phone' => null,
                        'company' => null,
                        'country' => null,
                    ],
                ],
                [
                    'id' => 2,
                    'event_id' => 1,
                    'technician_id' => 2,
                    'start_time' => '2018-12-18 14:00:00',
                    'end_time' => '2018-12-18 18:00:00',
                    'position' => 'Technicien plateau',
                    'technician' => [
                        'id' => 2,
                        'first_name' => 'Roger',
                        'last_name' => 'Rabbit',
                        'nickname' => 'Riri',
                        'full_name' => 'Roger Rabbit',
                        'phone' => null,
                        'company' => null,
                        'country' => null,
                    ],
                ],
            ],
            'beneficiaries' => [
                [
                    'id' => 3,
                    'first_name' => 'Client',
                    'last_name' => 'Benef',
                    'full_name' => 'Client Benef',
                    'reference' => null,
                    'phone' => '+33123456789',
                    'street' => '156 bis, avenue des tests poussés',
                    'postal_code' => '88080',
                    'locality' => 'Wazzaville',
                    'company_id' => null,
                    'company' => null,
                    'country' => null,
                    'pivot' => [
                        'event_id' => '1',
                        'person_id' => '3',
                    ],
                ],
            ],
            'materials' => [
                [
                    'id' => 4,
                    'name' => 'Showtec SDS-6',
                    'description' => 'Console DMX (jeu d\'orgue) Showtec 6 canaux',
                    'reference' => 'SDS-6-01',
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
                    'tags' => [],
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
                    'pivot' => [
                        'id' => 3,
                        'event_id' => 1,
                        'material_id' => 4,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_broken' => 1,
                    ],
                ],
                [
                    'id' => 2,
                    'name' => 'Processeur DBX PA2',
                    'description' => 'Système de diffusion numérique',
                    'reference' => 'DBXPA2',
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
                    'tags' => [
                        ['id' => 3, 'name' => 'pro'],
                    ],
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
                    'pivot' => [
                        'id' => 2,
                        'event_id' => 1,
                        'material_id' => 2,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_broken' => 0,
                    ],
                ],
                [
                    'id' => 1,
                    'name' => 'Console Yamaha CL3',
                    'description' => 'Console numérique 64 entrées / 8 sorties + Master + Sub',
                    'reference' => 'CL3',
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
                    'tags' => [
                        ['id' => 3, 'name' => 'pro'],
                    ],
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
                    'pivot' => [
                        'id' => 1,
                        'event_id' => 1,
                        'material_id' => 1,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_broken' => 0,
                    ],
                ],
            ],
            'bills' => [
                [
                    'id' => 1,
                    'number' => '2020-00001',
                    'date' => '2020-01-30 14:00:00',
                    'discount_rate' => 50.0,
                    'due_amount' => 325.5,
                ],
            ],
            'estimates' => [
                [
                    'id' => 1,
                    'date' => '2021-01-30 14:00:00',
                    'discount_rate' => 50.0,
                    'due_amount' => 325.5,
                ],
            ],
            'created_at' => null,
            'updated_at' => 'fakedTestContent',
            'deleted_at' => null,
        ];

        // - Test avec des données simples
        $data = [
            'id' => 1,
            'user_id' => 1,
            'title' => "Premier événement modifié",
            'description' => null,
            'start_date' => '2018-12-17 00:00:00',
            'end_date' => '2018-12-18 23:59:59',
            'is_confirmed' => true,
            'is_archived' => false,
            'location' => 'Gap et Briançon',
            'is_billable' => false,
        ];
        $this->client->put('/api/events/1', $data);
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData($expected, ['updated_at']);

        // - Test avec des données qui contiennent les sous-entités (hasMany)
        $dataWithChildren = array_merge($data, [
            'beneficiaries' => [2],
            'technicians' => [
                [
                    'id' => 1,
                    'start_time' => '2018-12-17 10:30:00',
                    'end_time' => '2018-12-18 23:30:00',
                    'position' => 'Régisseur général',
                ],
                [
                    'id' => 2,
                    'start_time' => '2018-12-18 13:30:00',
                    'end_time' => '2018-12-18 23:30:00',
                    'position' => 'Technicien polyvalent',
                ],
            ],
            'materials' => [
                ['id' => 1, 'quantity' => 2],
                ['id' => 2, 'quantity' => 4],
                ['id' => 4, 'quantity' => 3],
            ],
        ]);
        $this->client->put('/api/events/1', $dataWithChildren);
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(2, $response['beneficiaries'][0]['id']);
        $this->assertEquals('Showtec SDS-6', $response['materials'][0]['name']);
        $this->assertEquals(3, $response['materials'][0]['pivot']['quantity']);
        $this->assertEquals('Jean Fountain', $response['technicians'][0]['technician']['full_name']);
        $this->assertEquals('2018-12-17 10:30:00', $response['technicians'][0]['start_time']);
        $this->assertEquals('2018-12-18 23:30:00', $response['technicians'][0]['end_time']);
        $this->assertEquals('Régisseur général', $response['technicians'][0]['position']);
        $this->assertEquals('Roger Rabbit', $response['technicians'][1]['technician']['full_name']);
        $this->assertEquals('2018-12-18 13:30:00', $response['technicians'][1]['start_time']);
        $this->assertEquals('2018-12-18 23:30:00', $response['technicians'][1]['end_time']);
        $this->assertEquals('Technicien polyvalent', $response['technicians'][1]['position']);
    }

    public function testDuplicateEventNotFound()
    {
        $this->client->post('/api/events/999/duplicate', []);
        $this->assertNotFound();
    }

    public function testDuplicateEventBadData()
    {
        $data = ['user_id' => 1];
        $this->client->post('/api/events/1/duplicate', $data);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $response = $this->_getResponseAsArray();
        $expected = [
            'start_date' => [
                'start_date must not be empty',
                'start_date must be a valid date',
            ],
            'end_date' => [
                'end_date must be valid',
            ],
        ];
        $this->assertEquals($expected, $response['error']['details']);
    }

    public function testDuplicateEvent()
    {
        // - Duplication de l'événement n°1
        $data = [
            'user_id' => 1,
            'start_date' => '2021-07-01 00:00:00',
            'end_date' => '2021-07-03 23:59:59',
        ];
        $this->client->post('/api/events/1/duplicate', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(7, $response['id']);
        $this->assertEquals("Premier événement", $response['title']);
        $this->assertEquals('2021-07-01 00:00:00', $response['start_date']);
        $this->assertEquals('2021-07-03 23:59:59', $response['end_date']);
        $this->assertCount(1, $response['beneficiaries']);
        $this->assertCount(2, $response['technicians']);
        $this->assertEquals('2021-07-01 09:00:00', $response['technicians'][0]['start_time']);
        $this->assertEquals('2021-07-02 22:00:00', $response['technicians'][0]['end_time']);
        $this->assertEquals('Régisseur', $response['technicians'][0]['position']);
        $this->assertEquals('2021-07-02 14:00:00', $response['technicians'][1]['start_time']);
        $this->assertEquals('2021-07-02 18:00:00', $response['technicians'][1]['end_time']);
        $this->assertEquals('Technicien plateau', $response['technicians'][1]['position']);
        $this->assertCount(3, $response['materials']);
        $this->assertEquals(1, $response['materials'][0]['pivot']['quantity']);
        $this->assertEquals(1, $response['materials'][1]['pivot']['quantity']);
        $this->assertEquals(1, $response['materials'][2]['pivot']['quantity']);
        $this->assertFalse($response['is_confirmed']);
        $this->assertFalse($response['is_archived']);
        $this->assertFalse($response['is_return_inventory_done']);
        $this->assertTrue($response['is_billable']);

        // - Duplication de l'événement n°3
        $data = [
            'user_id' => 1,
            'start_date' => '2021-07-04 00:00:00',
            'end_date' => '2021-07-04 23:59:59',
        ];
        $this->client->post('/api/events/3/duplicate', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(8, $response['id']);
        $this->assertEquals("Avant-premier événement", $response['title']);
        $this->assertEquals('2021-07-04 00:00:00', $response['start_date']);
        $this->assertEquals('2021-07-04 23:59:59', $response['end_date']);
        $this->assertFalse($response['is_archived']);
        $this->assertFalse($response['is_return_inventory_done']);
        $this->assertFalse($response['is_billable']);
    }

    public function testUpdateMaterialReturnNotFound()
    {
        $this->client->put('/api/events/999/return');
        $this->assertNotFound();
    }

    public function testUpdateMaterialReturn()
    {
        $data = [
            ['id' => 1, 'actual' => 2, 'broken' => 0],
            ['id' => 2, 'actual' => 2, 'broken' => 1],
        ];
        $this->client->put('/api/events/2/return', $data);
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();

        $expectedFirst = [
            'event_id' => 2,
            'material_id' => 2,
            'id' => 5,
            'quantity' => 2,
            'quantity_returned' => 2,
            'quantity_broken' => 1,
        ];
        $this->assertEquals($expectedFirst, $response['materials'][0]['pivot']);

        $expectedSecond = [
            'event_id' => 2,
            'material_id' => 1,
            'id' => 4,
            'quantity' => 3,
            'quantity_returned' => 2,
            'quantity_broken' => 0,
        ];
        $this->assertEquals($expectedSecond, $response['materials'][1]['pivot']);
    }

    public function testUpdateMaterialReturnBadData()
    {
        $data = [
            ['id' => 1, 'actual' => 2, 'broken' => 3],
            ['id' => 2, 'actual' => 3, 'broken' => 0],
        ];
        $this->client->put('/api/events/2/return', $data);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $response = $this->_getResponseAsArray();
        $expected = [
            ['id' => 1, 'message' => "La quantité en panne ne peut pas être supérieure à la quantité retournée."],
            ['id' => 2, 'message' => "La quantité retournée ne peut pas être supérieure à la quantité sortie."],
        ];
        $this->assertEquals($expected, $response['error']['details']);
    }

    public function testUpdateMaterialTerminate()
    {
        $data = [
            ['id' => 1, 'actual' => 3, 'broken' => 0],
            ['id' => 2, 'actual' => 2, 'broken' => 1],
        ];
        $this->client->put('/api/events/2/terminate', $data);
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();

        $this->assertTrue($response['is_confirmed']);
        $this->assertTrue($response['is_return_inventory_done']);

        $expectedFirst = [
            'event_id' => 2,
            'material_id' => 2,
            'id' => 5,
            'quantity' => 2,
            'quantity_returned' => 2,
            'quantity_broken' => 1,
        ];
        $this->assertEquals($expectedFirst, $response['materials'][0]['pivot']);
        $this->assertEquals(1, $response['materials'][0]['out_of_order_quantity']);

        $expectedSecond = [
            'event_id' => 2,
            'material_id' => 1,
            'id' => 4,
            'quantity' => 3,
            'quantity_returned' => 3,
            'quantity_broken' => 0,
        ];
        $this->assertEquals($expectedSecond, $response['materials'][1]['pivot']);
        $this->assertEquals(1, $response['materials'][1]['out_of_order_quantity']);
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
        $this->assertNotFound();
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
        $this->assertEmpty($response['deletedAt']);
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
                'id' => 2,
                'name' => 'Processeur DBX PA2',
                'description' => 'Système de diffusion numérique',
                'reference' => 'DBXPA2',
                'is_unitary' => false,
                'park_id' => 1,
                'category_id' => 1,
                'sub_category_id' => 2,
                'rental_price' => 25.5,
                'stock_quantity' => 2,
                'remaining_quantity' => 0,
                'missing_quantity' => 1,
                'out_of_order_quantity' => null,
                'replacement_price' => 349.9,
                'is_hidden_on_bill' => false,
                'is_discountable' => true,
                'tags' => [
                    ['id' => 3, 'name' => 'pro'],
                ],
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
                'pivot' => [
                    'id' => 2,
                    'event_id' => 1,
                    'material_id' => 2,
                    'quantity' => 1,
                    'quantity_returned' => 1,
                    'quantity_broken' => 0,
                ],
            ],
        ]);

        // - Event not found
        $this->client->get('/api/events/999/missing-materials');
        $this->assertNotFound();
    }

    public function testDownloadPdf()
    {
        // - Event does not exists
        $this->client->get('/events/999/pdf');
        $this->assertStatusCode(404);

        // - Download event n°1 PDF file
        $responseStream = $this->client->get('/events/1/pdf');
        $this->assertStatusCode(200);
        $this->assertTrue($responseStream->isReadable());
    }

    public function testGetEventsWithMaterials()
    {
        $this->client->get('/api/events?start=2018-01-01&end=2018-12-31&with-materials=true');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'data' => [
                [
                    'id' => 3,
                    'user_id' => 1,
                    'title' => 'Avant-premier événement',
                    'description' => null,
                    'reference' => null,
                    'start_date' => '2018-12-15 00:00:00',
                    'end_date' => '2018-12-16 23:59:59',
                    'is_confirmed' => false,
                    'is_archived' => true,
                    'location' => 'Brousse',
                    'is_billable' => false,
                    'is_return_inventory_done' => false,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                    'beneficiaries' => [],
                    'technicians' => [],
                    'materials' => [
                        [
                            'id' => 5,
                            'name' => 'Câble XLR 10m',
                            'description' => 'Câble audio XLR 10 mètres, mâle-femelle',
                            'reference' => 'XLR10',
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
                            'tags' => [
                            ],
                            'attributes' => [
                            ],
                            'pivot' => [
                                'event_id' => 3,
                                'material_id' => 5,
                                'id' => 8,
                                'quantity' => 12,
                                'quantity_returned' => 0,
                                'quantity_broken' => 0
                            ]
                        ],
                        [
                            'id' => 3,
                            'name' => 'PAR64 LED',
                            'description' => 'Projecteur PAR64 à LED, avec son set de gélatines',
                            'reference' => 'PAR64LED',
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
                            'tags' => [
                                [
                                    'id' => 3,
                                    'name' => 'pro'
                                ]
                            ],
                            'attributes' => [
                                [
                                    'id' => 3,
                                    'name' => 'Puissance',
                                    'type' => 'integer',
                                    'unit' => 'W',
                                    'value' => 150
                                ],
                                [
                                    'id' => 1,
                                    'name' => 'Poids',
                                    'type' => 'float',
                                    'unit' => 'kg',
                                    'value' => 0.85
                                ]
                            ],
                            'pivot' => [
                                'event_id' => 3,
                                'material_id' => 3,
                                'id' => 6,
                                'quantity' => 10,
                                'quantity_returned' => 0,
                                'quantity_broken' => 0
                            ]
                        ],
                        [
                            'id' => 2,
                            'name' => 'Processeur DBX PA2',
                            'description' => 'Système de diffusion numérique',
                            'reference' => 'DBXPA2',
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
                            'tags' => [
                                [
                                    'id' => 3,
                                    'name' => 'pro'
                                ]
                            ],
                            'attributes' => [
                                [
                                    'id' => 3,
                                    'name' => 'Puissance',
                                    'type' => 'integer',
                                    'unit' => 'W',
                                    'value' => 35
                                ],
                                [
                                    'id' => 1,
                                    'name' => 'Poids',
                                    'type' => 'float',
                                    'unit' => 'kg',
                                    'value' => 2.2
                                ]
                            ],
                            'pivot' => [
                                'event_id' => 3,
                                'material_id' => 2,
                                'id' => 7,
                                'quantity' => 1,
                                'quantity_returned' => 0,
                                'quantity_broken' => 0
                            ]
                        ],
                    ],
                    'has_missing_materials' => null,
                    'has_not_returned_materials' => null,
                    'parks' => [1],
                ],
                [
                    'id' => 1,
                    'user_id' => 1,
                    'title' => 'Premier événement',
                    'description' => null,
                    'reference' => null,
                    'start_date' => '2018-12-17 00:00:00',
                    'end_date' => '2018-12-18 23:59:59',
                    'is_confirmed' => false,
                    'is_archived' => false,
                    'location' => 'Gap',
                    'is_billable' => true,
                    'is_return_inventory_done' => true,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                    'beneficiaries' => [
                        [
                            'id' => 3,
                            'first_name' => 'Client',
                            'last_name' => 'Benef',
                            'full_name' => 'Client Benef',
                            'country' => null,
                            'company' => null,
                            'pivot' => [
                                'event_id' => '1',
                                'person_id' => '3'
                            ]
                        ]
                    ],
                    'technicians' => [
                        [
                            'id' => 1,
                            'event_id' => 1,
                            'technician_id' => 1,
                            'start_time' => '2018-12-17 09:00:00',
                            'end_time' => '2018-12-18 22:00:00',
                            'position' => 'Régisseur',
                            'technician' => [
                                'id' => 1,
                                'first_name' => 'Jean',
                                'last_name' => 'Fountain',
                                'nickname' => null,
                                'phone' => null,
                                'full_name' => 'Jean Fountain',
                                'country' => null,
                                'company' => null
                            ]
                        ],
                        [
                            'id' => 2,
                            'event_id' => 1,
                            'technician_id' => 2,
                            'start_time' => '2018-12-18 14:00:00',
                            'end_time' => '2018-12-18 18:00:00',
                            'position' => 'Technicien plateau',
                            'technician' => [
                                'id' => 2,
                                'first_name' => 'Roger',
                                'last_name' => 'Rabbit',
                                'nickname' => 'Riri',
                                'phone' => null,
                                'full_name' => 'Roger Rabbit',
                                'country' => null,
                                'company' => null
                            ]
                        ]
                    ],
                    'materials' => [
                        [
                            'id' => 1,
                            'name' => 'Console Yamaha CL3',
                            'description' => 'Console numérique 64 entrées / 8 sorties + Master + Sub',
                            'reference' => 'CL3',
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
                            'tags' => [
                                [
                                    'id' => 3,
                                    'name' => 'pro'
                                ]
                            ],
                            'attributes' => [
                                [
                                    'id' => 3,
                                    'name' => 'Puissance',
                                    'type' => 'integer',
                                    'unit' => 'W',
                                    'value' => 850
                                ],
                                [
                                    'id' => 2,
                                    'name' => 'Couleur',
                                    'type' => 'string',
                                    'unit' => null,
                                    'value' => 'Grise'
                                ],
                                [
                                    'id' => 1,
                                    'name' => 'Poids',
                                    'type' => 'float',
                                    'unit' => 'kg',
                                    'value' => 36.5
                                ]
                            ],
                            'pivot' => [
                                'event_id' => 1,
                                'material_id' => 1,
                                'id' => 1,
                                'quantity' => 1,
                                'quantity_returned' => 1,
                                'quantity_broken' => 0
                            ]
                        ],
                        [
                            'id' => 2,
                            'name' => 'Processeur DBX PA2',
                            'description' => 'Système de diffusion numérique',
                            'reference' => 'DBXPA2',
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
                            'tags' => [
                                [
                                    'id' => 3,
                                    'name' => 'pro'
                                ]
                            ],
                            'attributes' => [
                                [
                                    'id' => 3,
                                    'name' => 'Puissance',
                                    'type' => 'integer',
                                    'unit' => 'W',
                                    'value' => 35
                                ],
                                [
                                    'id' => 1,
                                    'name' => 'Poids',
                                    'type' => 'float',
                                    'unit' => 'kg',
                                    'value' => 2.2
                                ]
                            ],
                            'pivot' => [
                                'event_id' => 1,
                                'material_id' => 2,
                                'id' => 2,
                                'quantity' => 1,
                                'quantity_returned' => 1,
                                'quantity_broken' => 0
                            ]
                        ],
                        [
                            'id' => 4,
                            'name' => 'Showtec SDS-6',
                            'description' => "Console DMX (jeu d'orgue) Showtec 6 canaux",
                            'reference' => 'SDS-6-01',
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
                            'tags' => [
                            ],
                            'attributes' => [
                                [
                                    'id' => 4,
                                    'name' => 'Conforme',
                                    'type' => 'boolean',
                                    'unit' => null,
                                    'value' => true
                                ],
                                [
                                    'id' => 3,
                                    'name' => 'Puissance',
                                    'type' => 'integer',
                                    'unit' => 'W',
                                    'value' => 60
                                ],
                                [
                                    'id' => 1,
                                    'name' => 'Poids',
                                    'type' => 'float',
                                    'unit' => 'kg',
                                    'value' => 3.15
                                ]
                            ],
                            'pivot' => [
                                'event_id' => 1,
                                'material_id' => 4,
                                'id' => 3,
                                'quantity' => 1,
                                'quantity_returned' => 1,
                                'quantity_broken' => 1
                            ]
                        ]
                    ],
                    'has_missing_materials' => null,
                    'has_not_returned_materials' => false,
                    'parks' => [1],
                ],
                [
                    'id' => 2,
                    'user_id' => 1,
                    'title' => 'Second événement',
                    'description' => null,
                    'reference' => null,
                    'start_date' => '2018-12-18 00:00:00',
                    'end_date' => '2018-12-19 23:59:59',
                    'is_confirmed' => false,
                    'is_archived' => false,
                    'location' => 'Lyon',
                    'is_billable' => true,
                    'is_return_inventory_done' => true,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                    'beneficiaries' => [
                        [
                            'id' => 3,
                            'first_name' => 'Client',
                            'last_name' => 'Benef',
                            'full_name' => 'Client Benef',
                            'country' => null,
                            'company' => null,
                            'pivot' => [
                                'event_id' => '2',
                                'person_id' => '3'
                            ]
                        ]
                    ],
                    'technicians' => [],
                    'materials' => [
                        [
                            'id' => 1,
                            'name' => 'Console Yamaha CL3',
                            'description' => 'Console numérique 64 entrées / 8 sorties + Master + Sub',
                            'reference' => 'CL3',
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
                            'tags' => [
                                [
                                    'id' => 3,
                                    'name' => 'pro'
                                ]
                            ],
                            'attributes' => [
                                [
                                    'id' => 3,
                                    'name' => 'Puissance',
                                    'type' => 'integer',
                                    'unit' => 'W',
                                    'value' => 850
                                ],
                                [
                                    'id' => 2,
                                    'name' => 'Couleur',
                                    'type' => 'string',
                                    'unit' => null,
                                    'value' => 'Grise'
                                ],
                                [
                                    'id' => 1,
                                    'name' => 'Poids',
                                    'type' => 'float',
                                    'unit' => 'kg',
                                    'value' => 36.5
                                ]
                            ],
                            'pivot' => [
                                'event_id' => 2,
                                'material_id' => 1,
                                'id' => 4,
                                'quantity' => 3,
                                'quantity_returned' => 2,
                                'quantity_broken' => 0
                            ]
                        ],
                        [
                            'id' => 2,
                            'name' => 'Processeur DBX PA2',
                            'description' => 'Système de diffusion numérique',
                            'reference' => 'DBXPA2',
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
                            'tags' => [
                                [
                                    'id' => 3,
                                    'name' => 'pro'
                                ]
                            ],
                            'attributes' => [
                                [
                                    'id' => 3,
                                    'name' => 'Puissance',
                                    'type' => 'integer',
                                    'unit' => 'W',
                                    'value' => 35
                                ],
                                [
                                    'id' => 1,
                                    'name' => 'Poids',
                                    'type' => 'float',
                                    'unit' => 'kg',
                                    'value' => 2.2
                                ]
                            ],
                            'pivot' => [
                                'event_id' => 2,
                                'material_id' => 2,
                                'id' => 5,
                                'quantity' => 2,
                                'quantity_returned' => 2,
                                'quantity_broken' => 0
                            ]
                        ]
                    ],
                    'has_missing_materials' => null,
                    'has_not_returned_materials' => true,
                    'parks' => [1],
                ],
            ],
        ]);
    }

    public function testSearch()
    {
        // - Retourne la liste des événement qui ont le terme "premier" dans le titre
        $this->client->get('/api/events?search=premier');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            [
                'id' => 1,
                'title' => 'Premier événement',
                'location' => 'Gap',
                'startDate' => '2018-12-17 00:00:00',
                'endDate' => '2018-12-18 23:59:59',
            ],
            [
                'id' => 3,
                'title' => 'Avant-premier événement',
                'location' => 'Brousse',
                'startDate' => '2018-12-15 00:00:00',
                'endDate' => '2018-12-16 23:59:59',
            ],
        ]);

        // - Pareil, mais en excluant l'événement n°3
        $this->client->get('/api/events?search=premier&exclude=3');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            [
                'id' => 1,
                'title' => 'Premier événement',
                'location' => 'Gap',
                'startDate' => '2018-12-17 00:00:00',
                'endDate' => '2018-12-18 23:59:59',
            ],
        ]);
    }
}
