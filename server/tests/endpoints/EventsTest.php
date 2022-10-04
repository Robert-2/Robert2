<?php
namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Models\Event;

final class EventsTest extends ApiTestCase
{
    public function testGetEvents()
    {
        $this->client->get('/api/events?start=2018-01-01&end=2018-12-31');
        $this->assertStatusCode(StatusCode::STATUS_OK);
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
                    'is_return_inventory_done' => true,
                    'has_missing_materials' => null,
                    'has_not_returned_materials' => null,
                    'parks' => [1],
                    'beneficiaries' => [],
                    'technicians' => [],
                    'created_at' => null,
                    'updated_at' => null,
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
                        BeneficiariesTest::data(1),
                    ],
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
                    'created_at' => null,
                    'updated_at' => null,
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
                        BeneficiariesTest::data(3),
                    ],
                    'technicians' => [],
                    'created_at' => null,
                    'updated_at' => null,
                ],
            ]
        ]);

        $this->client->get('/api/events?start=2018-01-01&end=2018-12-31&deleted=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
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
            'is_return_inventory_done' => true,
            'has_missing_materials' => null,
            'has_not_returned_materials' => false,
            'created_at' => null,
            'updated_at' => null,
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
                array_merge(MaterialsTest::data(4), [
                    'pivot' => [
                        'id' => 3,
                        'event_id' => 1,
                        'material_id' => 4,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_broken' => 1,
                    ],
                ]),
                array_merge(MaterialsTest::data(2), [
                    'pivot' => [
                        'id' => 2,
                        'event_id' => 1,
                        'material_id' => 2,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_broken' => 0,
                    ],
                ]),
                array_merge(MaterialsTest::data(1), [
                    'pivot' => [
                        'id' => 1,
                        'event_id' => 1,
                        'material_id' => 1,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_broken' => 0,
                    ],
                ]),
            ],
            'bills' => [
                BillsTest::data(1),
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
        $this->assertEquals(2, $response['materials'][0]['pivot']['quantity']);
    }

    public function testUpdateEventNoData()
    {
        $this->client->put('/api/events/1', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertErrorMessage("No data was provided.");
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
            'user' => UsersTest::data(1),
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
                array_merge(MaterialsTest::data(4), [
                    'pivot' => [
                        'id' => 3,
                        'event_id' => 1,
                        'material_id' => 4,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_broken' => 1,
                    ],
                ]),
                array_merge(MaterialsTest::data(2), [
                    'pivot' => [
                        'id' => 2,
                        'event_id' => 1,
                        'material_id' => 2,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_broken' => 0,
                    ],
                ]),
                array_merge(MaterialsTest::data(1), [
                    'pivot' => [
                        'id' => 1,
                        'event_id' => 1,
                        'material_id' => 1,
                        'quantity' => 1,
                        'quantity_returned' => 1,
                        'quantity_broken' => 0,
                    ],
                ]),
            ],
            'bills' => [
                BillsTest::data(1),
            ],
            'estimates' => [
                EstimatesTest::data(1),
            ],
            'created_at' => null,
            'updated_at' => '__FAKE_TEST_PLACEHOLDER__',
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
        $this->assertStatusCode(StatusCode::STATUS_OK);
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
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(2, $response['beneficiaries'][0]['id']);
        $this->assertEquals('Showtec SDS-6', $response['materials'][0]['name']);
        $this->assertEquals(3, $response['materials'][0]['pivot']['quantity']);
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
        $this->assertNotFound();
    }

    public function testDuplicateEventBadData()
    {
        $data = ['user_id' => 1];
        $this->client->post('/api/events/1/duplicate', $data);
        $this->assertValidationError([
            'start_date' => [
                "This field is mandatory",
                "This date is not valid",
            ],
            'end_date' => [
                "This field is not valid",
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
        $this->assertStatusCode(StatusCode::STATUS_OK);
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
        $this->assertValidationError([
            ['id' => 1, 'message' => "Broken quantity cannot be greater than returned quantity."],
            ['id' => 2, 'message' => "Returned quantity cannot be greater than output quantity."],
        ]);
    }

    public function testUpdateMaterialTerminate()
    {
        $data = [
            ['id' => 1, 'actual' => 3, 'broken' => 0],
            ['id' => 2, 'actual' => 2, 'broken' => 1],
        ];
        $this->client->put('/api/events/2/terminate', $data);
        $this->assertStatusCode(StatusCode::STATUS_OK);
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
        // - First call: soft delete.
        $this->client->delete('/api/events/1');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $softDeleted = Event::withTrashed()->find(1);
        $this->assertNotNull($softDeleted);
        $this->assertNotEmpty($softDeleted->deleted_at);

        // - Second call: actually DESTROY record from DB
        $this->client->delete('/api/events/1');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $this->assertNull(Event::withTrashed()->find(1));
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
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);

        // - Then, restore event #1
        $this->client->put('/api/events/restore/1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertNotNull(Event::find(1));
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
                'missing_quantity' => 1,
                'pivot' => [
                    'id' => 2,
                    'event_id' => 1,
                    'material_id' => 2,
                    'quantity' => 1,
                    'quantity_returned' => 1,
                    'quantity_broken' => 0,
                ],
            ]),
        ]);

        // - Get missing materials for event #4
        $this->client->get('/api/events/4/missing-materials');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            array_replace(MaterialsTest::data(7), [
                'missing_quantity' => 2,
                'pivot' => [
                    'id' => 11,
                    'event_id' => 4,
                    'material_id' => 7,
                    'quantity' => 3,
                    'quantity_returned' => 0,
                    'quantity_broken' => 0,
                ],
            ]),
            array_replace(MaterialsTest::data(6), [
                'missing_quantity' => 2,
                'pivot' => [
                    'id' => 10,
                    'event_id' => 4,
                    'material_id' => 6,
                    'quantity' => 2,
                    'quantity_returned' => 1,
                    'quantity_broken' => 0,
                ],
            ]),
        ]);

        // - Event not found
        $this->client->get('/api/events/999/missing-materials');
        $this->assertNotFound();
    }

    public function testDownloadPdf()
    {
        // - Event does not exists
        $this->client->get('/events/999/pdf');
        $this->assertNotFound();

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
}
