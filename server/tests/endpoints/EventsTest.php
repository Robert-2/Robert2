<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Support\Carbon;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Models\Event;

final class EventsTest extends ApiTestCase
{
    public function testGetEventNotFound()
    {
        $this->client->get('/api/events/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testGetOneEvent()
    {
        $this->client->get('/api/events/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
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
            'vat_rate' => '20.00',
            'currency' => 'EUR',
            'daily_total_discount' => '0.00',
            'daily_total_discountable' => '41.45',
            'daily_total_taxes' => '68.29',
            'daily_total_with_taxes' => '409.74',
            'daily_total_without_discount' => '341.45',
            'daily_total_without_taxes' => '341.45',
            'total_replacement' => '19808.90',
            'total_taxes' => '119.51',
            'total_with_taxes' => '717.05',
            'total_without_taxes' => '597.54',
            'degressive_rate' => '1.75',
            'discount_rate' => '0',
            'duration' => 2,
            'is_return_inventory_done' => true,
            'has_missing_materials' => null,
            'has_not_returned_materials' => false,
            'created_at' => '2018-12-01 12:50:45',
            'updated_at' => '2018-12-05 08:31:21',
            'user' => UsersTest::data(1),
            'technicians' => [
                [
                    'id' => 1,
                    'event_id' => 1,
                    'technician_id' => 1,
                    'start_time' => '2018-12-17 09:00:00',
                    'end_time' => '2018-12-18 22:00:00',
                    'position' => 'Régisseur',
                    'technician' => TechniciansTest::data(1),
                ],
                [
                    'id' => 2,
                    'event_id' => 1,
                    'technician_id' => 2,
                    'start_time' => '2018-12-18 14:00:00',
                    'end_time' => '2018-12-18 18:00:00',
                    'position' => 'Technicien plateau',
                    'technician' => TechniciansTest::data(2),
                ],
            ],
            'beneficiaries' => [
                BeneficiariesTest::data(1),
            ],
            'materials' => [
                array_merge(MaterialsTest::data(1), [
                    'pivot' => [
                        'id' => 1,
                        'event_id' => 1,
                        'material_id' => 1,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_returned_broken' => 0,
                    ],
                ]),
                array_merge(MaterialsTest::data(2), [
                    'pivot' => [
                        'id' => 2,
                        'event_id' => 1,
                        'material_id' => 2,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_returned_broken' => 0,
                    ],
                ]),
                array_merge(MaterialsTest::data(4), [
                    'pivot' => [
                        'id' => 3,
                        'event_id' => 1,
                        'material_id' => 4,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_returned_broken' => 1,
                    ],
                ]),
            ],
            'parks' => [1],
            'invoices' => [
                InvoicesTest::data(1),
            ],
            'estimates' => [
                EstimatesTest::data(1),
            ],
        ]);
    }

    public function testCreateEvent()
    {
        // - Test avec des données simples
        $data = [
            'title' => "Un nouvel événement",
            'description' => null,
            'start_date' => '2019-09-01 00:00:00',
            'end_date' => '2019-09-03 23:59:59',
            'is_confirmed' => true,
            'is_archived' => false,
            'location' => 'Avignon',
        ];
        $this->client->post('/api/events', $data);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(7, $response['id']);
        $this->assertEquals(1, $response['user_id']);
        $this->assertEquals("Un nouvel événement", $response['title']);
        $this->assertEmpty($response['beneficiaries']);
        $this->assertEmpty($response['technicians']);
        $this->assertEmpty($response['materials']);

        // - Test avec des données qui contiennent les sous-entités (hasMany)
        $dataWithChildren = array_merge($data, [
            'title' => "Encore un événement",
            'user_id' => 2,
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
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(8, $response['id']);
        $this->assertEquals(2, $response['user_id']);
        $this->assertEquals("Encore un événement", $response['title']);
        $this->assertCount(1, $response['beneficiaries']);
        $this->assertCount(2, $response['technicians']);
        $this->assertNull($response['technicians'][0]['position']);
        $this->assertEquals('Régie générale', $response['technicians'][1]['position']);
        $this->assertCount(3, $response['materials']);

        $expectedData = [
            ['id' => 1, 'quantity' => 1],
            ['id' => 2, 'quantity' => 1],
            ['id' => 4, 'quantity' => 2],
        ];
        foreach ($expectedData as $index => $expected) {
            $this->assertArrayHasKey($index, $response['materials']);
            $resultMaterial = $response['materials'][$index];

            $this->assertEquals($expected['id'], $resultMaterial['id']);
            $this->assertEquals($expected['quantity'], $resultMaterial['pivot']['quantity']);
        }
    }

    public function testUpdateEventNoData()
    {
        $this->client->put('/api/events/1', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testUpdateEventNotFound()
    {
        $this->client->put('/api/events/999', ['name' => '__inexistant__']);
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testUpdateEvent()
    {
        Carbon::setTestNow(Carbon::create(2022, 10, 22, 18, 42, 36));

        // - Données attendues pour les tests qui suivent
        $expected = [
            'id' => 1,
            'user_id' => 1,
            'user' => UsersTest::data(1),
            'title' => "Premier événement modifié",
            'description' => null,
            'reference' => null,
            'start_date' => '2018-12-17 00:00:00',
            'end_date' => '2018-12-18 23:59:59',
            'is_confirmed' => true,
            'is_archived' => false,
            'location' => 'Gap et Briançon',
            'is_billable' => true,
            'vat_rate' => '20.00',
            'currency' => 'EUR',
            'daily_total_discount' => '0.00',
            'daily_total_discountable' => '41.45',
            'daily_total_taxes' => '68.29',
            'daily_total_with_taxes' => '409.74',
            'daily_total_without_discount' => '341.45',
            'daily_total_without_taxes' => '341.45',
            'total_replacement' => '19808.90',
            'total_taxes' => '119.51',
            'total_with_taxes' => '717.05',
            'total_without_taxes' => '597.54',
            'degressive_rate' => '1.75',
            'discount_rate' => '0',
            'duration' => 2,
            'is_return_inventory_done' => true,
            'has_missing_materials' => null,
            'has_not_returned_materials' => false,
            'technicians' => [
                [
                    'id' => 1,
                    'event_id' => 1,
                    'technician_id' => 1,
                    'start_time' => '2018-12-17 09:00:00',
                    'end_time' => '2018-12-18 22:00:00',
                    'position' => 'Régisseur',
                    'technician' => TechniciansTest::data(1),
                ],
                [
                    'id' => 2,
                    'event_id' => 1,
                    'technician_id' => 2,
                    'start_time' => '2018-12-18 14:00:00',
                    'end_time' => '2018-12-18 18:00:00',
                    'position' => 'Technicien plateau',
                    'technician' => TechniciansTest::data(2),
                ],
            ],
            'beneficiaries' => [
                BeneficiariesTest::data(1),
            ],
            'materials' => [
                array_merge(MaterialsTest::data(1), [
                    'pivot' => [
                        'id' => 1,
                        'event_id' => 1,
                        'material_id' => 1,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_returned_broken' => 0,
                    ],
                ]),
                array_merge(MaterialsTest::data(2), [
                    'pivot' => [
                        'id' => 2,
                        'event_id' => 1,
                        'material_id' => 2,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_returned_broken' => 0,
                    ],
                ]),
                array_merge(MaterialsTest::data(4), [
                    'pivot' => [
                        'id' => 3,
                        'event_id' => 1,
                        'material_id' => 4,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_returned_broken' => 1,
                    ],
                ]),
            ],
            'parks' => [1],
            'invoices' => [
                InvoicesTest::data(1),
            ],
            'estimates' => [
                EstimatesTest::data(1),
            ],
            'created_at' => '2018-12-01 12:50:45',
            'updated_at' => '2022-10-22 18:42:36',
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
        ];
        $this->client->put('/api/events/1', $data);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData($expected);

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
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(2, $response['beneficiaries'][0]['id']);
        $this->assertEquals('Console Yamaha CL3', $response['materials'][0]['name']);
        $this->assertEquals(2, $response['materials'][0]['pivot']['quantity']);
        $this->assertEquals('Roger Rabbit', $response['technicians'][0]['technician']['full_name']);
        $this->assertEquals('2018-12-17 10:30:00', $response['technicians'][0]['start_time']);
        $this->assertEquals('2018-12-18 23:30:00', $response['technicians'][0]['end_time']);
        $this->assertEquals('Régisseur général', $response['technicians'][0]['position']);
        $this->assertEquals('Jean Technicien', $response['technicians'][1]['technician']['full_name']);
        $this->assertEquals('2018-12-18 13:30:00', $response['technicians'][1]['start_time']);
        $this->assertEquals('2018-12-18 23:30:00', $response['technicians'][1]['end_time']);
        $this->assertEquals('Technicien polyvalent', $response['technicians'][1]['position']);
    }

    public function testDuplicateEventNotFound()
    {
        $this->client->post('/api/events/999/duplicate', []);
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testDuplicateEventBadData()
    {
        $data = ['user_id' => 1];
        $this->client->post('/api/events/1/duplicate', $data);
        $this->assertApiValidationError([
            'start_date' => [
                "This field is mandatory",
                "This date is not valid",
            ],
            'end_date' => [
                "This date is not valid",
            ],
        ]);
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
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
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
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(8, $response['id']);
        $this->assertEquals("Avant-premier événement", $response['title']);
        $this->assertEquals('2021-07-04 00:00:00', $response['start_date']);
        $this->assertEquals('2021-07-04 23:59:59', $response['end_date']);
        $this->assertFalse($response['is_archived']);
        $this->assertFalse($response['is_return_inventory_done']);
        $this->assertFalse($response['is_billable']);
    }

    public function testUpdateReturnInventoryNotFound()
    {
        $this->client->put('/api/events/999/inventory');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testUpdateReturnInventory()
    {
        $data = [
            ['id' => 1, 'actual' => 2, 'broken' => 0],
            ['id' => 2, 'actual' => 2, 'broken' => 1],
        ];
        $this->client->put('/api/events/2/inventory', $data);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();

        $expectedMaterialData = [
            [
                'id' => 4,
                'event_id' => 2,
                'material_id' => 1,
                'quantity' => 3,
                'quantity_returned' => 2,
                'quantity_returned_broken' => 0,
            ],
            [
                'id' => 5,
                'event_id' => 2,
                'material_id' => 2,
                'quantity' => 2,
                'quantity_returned' => 2,
                'quantity_returned_broken' => 1,
            ],
        ];
        foreach ($expectedMaterialData as $index => $expected) {
            $this->assertArrayHasKey($index, $response['materials']);
            $material = $response['materials'][$index];

            $this->assertEquals($expected, $material['pivot']);
        }
    }

    public function testUpdateReturnInventoryBadData()
    {
        $data = [
            ['id' => 1, 'actual' => 2, 'broken' => 3],
            ['id' => 2, 'actual' => 3, 'broken' => 0],
        ];
        $this->client->put('/api/events/2/inventory', $data);
        $this->assertApiValidationError([
            ['id' => 1, 'message' => "Broken quantity cannot be greater than returned quantity."],
            ['id' => 2, 'message' => "Returned quantity cannot be greater than output quantity."],
        ]);
    }

    public function testFinishReturnInventory()
    {
        Carbon::setTestNow(Carbon::create(2023, 2, 1, 10, 00, 00));

        $this->client->put('/api/events/2/inventory/finish', [
            ['id' => 1, 'actual' => 3, 'broken' => 0],
            ['id' => 2, 'actual' => 2, 'broken' => 1],
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'id' => 2,
            'user_id' => 1,
            'title' => "Second événement",
            'description' => null,
            'reference' => null,
            'start_date' => '2018-12-18 00:00:00',
            'end_date' => '2018-12-19 23:59:59',
            'is_confirmed' => true,
            'is_archived' => false,
            'location' => 'Lyon',
            'is_billable' => true,
            'vat_rate' => '20.00',
            'currency' => 'EUR',
            'daily_total_discount' => '0.00',
            'daily_total_discountable' => '51.00',
            'daily_total_taxes' => '190.20',
            'daily_total_with_taxes' => '1141.20',
            'daily_total_without_discount' => '951.00',
            'daily_total_without_taxes' => '951.00',
            'total_replacement' => '58899.80',
            'total_taxes' => '332.85',
            'total_with_taxes' => '1997.10',
            'total_without_taxes' => '1664.25',
            'degressive_rate' => '1.75',
            'discount_rate' => '0',
            'duration' => 2,
            'is_return_inventory_done' => true,
            'has_missing_materials' => null,
            'has_not_returned_materials' => false,
            'beneficiaries' => [
                [
                    'id' => 3,
                    'reference' => '0003',
                    'company_id' => null,
                    'note' => null,
                    'first_name' => 'Client',
                    'last_name' => 'Benef',
                    'full_name' => 'Client Benef',
                    'email' => 'client@beneficiaires.com',
                    'phone' => '+33123456789',
                    'street' => "156 bis, avenue des tests poussés",
                    'postal_code' => '88080',
                    'locality' => 'Wazzaville',
                    'full_address' => "156 bis, avenue des tests poussés\n88080 Wazzaville",
                    'can_make_reservation' => false,
                    'company' => null,
                    'country' => null,
                    'country_id' => null,
                    'user_id' => null,
                ],
            ],
            'technicians' => [],
            'estimates' => [],
            'invoices' => [],
            'user' => [
                'id' => 1,
                'pseudo' => "test1",
                'email' => "tester@robertmanager.net",
                'group' => "admin",
                'language' => 'en',
                'notifications_enabled' => true,
                'first_name' => "Jean",
                'last_name' => "Fountain",
                'full_name' => "Jean Fountain",
                'phone' => null,
            ],
            'materials' => [
                [
                    'id' => 1,
                    'name' => "Console Yamaha CL3",
                    'description' => "Console numérique 64 entrées / 8 sorties + Master + Sub",
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
                    'is_reservable' => true,
                    'picture' => 'http://loxya.test/materials/1/picture',
                    'note' => null,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                    'tags' => [
                        ['id' => 1, 'name' => 'pro'],
                    ],
                    'attributes' => [
                        [
                            'id' => 1,
                            'name' => 'Poids',
                            'type' => 'float',
                            'unit' => 'kg',
                            'value' => 36.5,
                        ],
                        [
                            'id' => 2,
                            'name' => 'Couleur',
                            'type' => 'string',
                            'unit' => null,
                            'value' => 'Grise',
                        ],
                        [
                            'id' => 3,
                            'name' => 'Puissance',
                            'type' => 'integer',
                            'unit' => 'W',
                            'value' => 850,
                        ],
                    ],
                    'pivot' => [
                        'id' => 4,
                        'event_id' => 2,
                        'material_id' => 1,
                        'quantity' => 3,
                        'quantity_returned' => 3,
                        'quantity_returned_broken' => 0,
                    ],
                ],
                [
                    'id' => 2,
                    'name' => "Processeur DBX PA2",
                    'description' => "Système de diffusion numérique",
                    'reference' => 'DBXPA2',
                    'is_unitary' => false,
                    'park_id' => 1,
                    'category_id' => 1,
                    'sub_category_id' => 2,
                    'rental_price' => 25.5,
                    'stock_quantity' => 2,
                    'out_of_order_quantity' => 1,
                    'replacement_price' => 349.9,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => true,
                    'is_reservable' => false,
                    'picture' => null,
                    'note' => null,
                    'created_at' => null,
                    'updated_at' => '2023-02-01 10:00:00',
                    'deleted_at' => null,
                    'tags' => [
                        ['id' => 1, 'name' => 'pro'],
                    ],
                    'attributes' => [
                        [
                            'id' => 1,
                            'name' => 'Poids',
                            'type' => 'float',
                            'unit' => 'kg',
                            'value' => 2.2,
                        ],
                        [
                            'id' => 3,
                            'name' => 'Puissance',
                            'type' => 'integer',
                            'unit' => 'W',
                            'value' => 35,
                        ],
                    ],
                    'pivot' => [
                        'id' => 5,
                        'event_id' => 2,
                        'material_id' => 2,
                        'quantity' => 2,
                        'quantity_returned' => 2,
                        'quantity_returned_broken' => 1,
                    ],
                ],
            ],
            'parks' => [1],
            'created_at' => '2018-12-16 12:50:45',
            'updated_at' => '2023-02-01 10:00:00',
        ]);
    }

    public function testArchiveEvent()
    {
        // - Archivage de l'événement #1
        //   possible, car inventaire de retour terminé
        $this->client->put('/api/events/1/archive');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseHasKeyEquals('is_archived', true);

        // - Archivage de l'événement #4
        //   impossible car inventaire de retour pas encore fait
        $this->client->put('/api/events/4/archive');
        $this->assertApiValidationError([
            'is_archived' => [
                "An event cannot be archived if its return inventory is not done!",
            ],
        ]);
    }

    public function testUnarchiveEvent()
    {
        // - Désarchivage de l'événement #3
        $this->client->put('/api/events/3/unarchive');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseHasKeyEquals('is_archived', false);
    }

    public function testDeleteAndDestroyEvent()
    {
        // - Suppression (soft delete) de l'événement #4
        //   possible car pas d'inventaire de retour ni confirmé
        $this->client->delete('/api/events/4');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $event = Event::withTrashed()->find(4);
        $this->assertNotNull($event);
        $this->assertNotEmpty($event->deleted_at);

        // - Suppression définitive de l'événement #4
        $this->client->delete('/api/events/4');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $this->assertNull(Event::withTrashed()->find(4));
    }

    public function testDeleteEventFail()
    {
        // - On ne peut pas supprimer l'événement #1
        //   car son inventaire de retour est terminé
        $this->client->delete('/api/events/1');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Confirmation de l'événement #4 au préalable
        $event = Event::find(4);
        $event->is_confirmed = true;
        $event->save();

        // - On ne peut plus supprimer l'événement #4 car il est confirmé
        $this->client->delete('/api/events/4');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testRestoreEventNotFound()
    {
        $this->client->put('/api/events/restore/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testRestoreEvent()
    {
        // - Suppression de l'événement #4 au préalable
        $this->client->delete('/api/events/4');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);

        // - Puis restauration de l'événement #4
        $this->client->put('/api/events/restore/4');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertNotNull(Event::find(4));
    }

    public function testGetMissingMaterials()
    {
        // - Get missing materials for event #3 (no missing materials)
        $this->client->get('/api/events/3/missing-materials');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([]);

        // - Get missing materials for event #1
        $this->client->get('/api/events/1/missing-materials');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            array_replace(MaterialsTest::data(2), [
                'pivot' => [
                    'id' => 2,
                    'event_id' => 1,
                    'material_id' => 2,
                    'quantity' => 1,
                    'quantity_returned' => 1,
                    'quantity_returned_broken' => 0,
                    'quantity_missing' => 1,
                ],
            ]),
        ]);

        // - Get missing materials for event #4
        $this->client->get('/api/events/4/missing-materials');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            array_replace(MaterialsTest::data(6), [
                'pivot' => [
                    'id' => 10,
                    'event_id' => 4,
                    'material_id' => 6,
                    'quantity' => 2,
                    'quantity_returned' => 1,
                    'quantity_returned_broken' => 0,
                    'quantity_missing' => 2,
                ],
            ]),
            array_replace(MaterialsTest::data(7), [
                'pivot' => [
                    'id' => 11,
                    'event_id' => 4,
                    'material_id' => 7,
                    'quantity' => 3,
                    'quantity_returned' => 0,
                    'quantity_returned_broken' => 0,
                    'quantity_missing' => 2,
                ],
            ]),
        ]);

        // - Event not found
        $this->client->get('/api/events/999/missing-materials');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testDownloadPdf()
    {
        Carbon::setTestNow(Carbon::create(2022, 9, 23, 12, 0, 0));

        // - Event does not exists
        $this->client->get('/events/999/pdf');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Download event n°1 PDF file
        $responseStream = $this->client->get('/events/1/pdf');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertTrue($responseStream->isReadable());
        $this->assertMatchesHtmlSnapshot($responseStream->getContents());

        // - Download event n°2 PDF file
        $responseStream = $this->client->get('/events/2/pdf');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertTrue($responseStream->isReadable());
        $this->assertMatchesHtmlSnapshot($responseStream->getContents());
    }

    public function testSearch()
    {
        // - Retourne la liste des événement qui ont le terme "premier" dans le titre
        $this->client->get('/api/events?search=premier');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'count' => 2,
            'data' => [
                [
                    'id' => 1,
                    'title' => 'Premier événement',
                    'location' => 'Gap',
                    'start_date' => '2018-12-17 00:00:00',
                    'end_date' => '2018-12-18 23:59:59',
                ],
                [
                    'id' => 3,
                    'title' => 'Avant-premier événement',
                    'location' => 'Brousse',
                    'start_date' => '2018-12-15 00:00:00',
                    'end_date' => '2018-12-16 23:59:59',
                ],
            ],
        ]);

        // - Pareil, mais en excluant l'événement n°3
        $this->client->get('/api/events?search=premier&exclude=3');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'count' => 1,
            'data' => [
                [
                    'id' => 1,
                    'title' => 'Premier événement',
                    'location' => 'Gap',
                    'start_date' => '2018-12-17 00:00:00',
                    'end_date' => '2018-12-18 23:59:59',
                ],
            ],
        ]);
    }

    public function testCreateInvoice()
    {
        Carbon::setTestNow(Carbon::create(2022, 10, 22, 18, 42, 36));

        $this->client->post('/api/events/2/invoices');
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 2,
            'number' => '2022-00001',
            'date' => '2022-10-22 18:42:36',
            'url' => 'http://loxya.test/invoices/2/pdf',
            'discount_rate' => '0.0000',
            'total_without_taxes' => '1664.25',
            'total_with_taxes' => '1997.10',
            'currency' => 'EUR',
        ]);
    }

    public function testCreateInvoiceWithDiscount()
    {
        Carbon::setTestNow(Carbon::create(2020, 10, 22, 18, 42, 36));

        $this->client->post('/api/events/2/invoices', ['discountRate' => 50.0]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 2,
            'number' => '2020-00002',
            'date' => '2020-10-22 18:42:36',
            'url' => 'http://loxya.test/invoices/2/pdf',
            'discount_rate' => '50.0000',
            'total_without_taxes' => '1619.63',
            'total_with_taxes' => '1943.56',
            'currency' => 'EUR',
        ]);
    }

    public function testCreateEstimate()
    {
        Carbon::setTestNow(Carbon::create(2022, 10, 22, 18, 42, 36));

        $this->client->post('/api/events/2/estimates');
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 2,
            'date' => '2022-10-22 18:42:36',
            'url' => 'http://loxya.test/estimates/2/pdf',
            'discount_rate' => '0.0000',
            'total_without_taxes' => '1664.25',
            'total_with_taxes' => '1997.10',
            'currency' => 'EUR',
        ]);
    }

    public function testCreateEstimateWithDiscount()
    {
        Carbon::setTestNow(Carbon::create(2022, 10, 22, 18, 42, 36));

        $this->client->post('/api/events/2/estimates', ['discountRate' => 50.0]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 2,
            'date' => '2022-10-22 18:42:36',
            'url' => 'http://loxya.test/estimates/2/pdf',
            'discount_rate' => '50.0000',
            'total_without_taxes' => '1619.63',
            'total_with_taxes' => '1943.56',
            'currency' => 'EUR',
        ]);
    }
}
