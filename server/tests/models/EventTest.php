<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Errors;
use Robert2\API\Models\Event;

final class EventTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Event();
    }

    public function testTableName(): void
    {
        $this->assertEquals('events', $this->model->getTable());
    }

    public function testGetAll(): void
    {
        $this->model->setPeriod('2018-01-15', '2018-12-19');
        $result = $this->model->getAll()->get()->toArray();
        $this->assertEquals([
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
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ]
        ], $result);
    }

    public function testGetMissingMaterials(): void
    {
        // - No missing materials for event #3
        $result = Event::getMissingMaterials(3);
        $this->assertNull($result);

        // - Get missing materials of event #1
        $result = Event::getMissingMaterials(1);
        $this->assertNotNull($result);
        $this->assertCount(1, $result);
        $this->assertEquals('DBXPA2', $result[0]['reference']);
        $this->assertEquals(1, $result[0]['missing_quantity']);

        // - Get missing materials of event #4
        $result = Event::getMissingMaterials(4);
        $this->assertNotNull($result);
        $this->assertCount(2, $result);
        $this->assertEquals('Transporter', $result[0]['reference']);
        $this->assertEquals(3, $result[0]['missing_quantity']);
    }

    public function testHasNotReturnedMaterials(): void
    {
        // - Event #1 does not have material not returned
        $result = Event::hasNotReturnedMaterials(1);
        $this->assertFalse($result);

        // - Event #2 have some materials not returned
        $result = Event::hasNotReturnedMaterials(2);
        $this->assertTrue($result);
    }

    public function testGetParks(): void
    {
        // - Non-existant event
        $result = Event::getParks(999);
        $this->assertEquals([], $result);

        // - Events with material from one park
        $result = Event::getParks(1);
        $this->assertEquals([1], $result);
        $result = Event::getParks(2);
        $this->assertEquals([1], $result);
        $result = Event::getParks(3);
        $this->assertEquals([1], $result);
        $result = Event::getParks(5);
        $this->assertEquals([], $result);

        // - Event with material from two parks
        $result = Event::getParks(4);
        $this->assertEquals([1], $result);

        // - Event without material (so without park)
        $result = Event::getParks(6);
        $this->assertEquals([], $result);
    }

    public function testGetMaterials(): void
    {
        $Event = $this->model::find(1);
        $results = $Event->materials;
        $this->assertCount(3, $results);
        $expected = [
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
            'replacement_price' => 59.0,
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
        ];
        $this->assertEquals($expected, $results[0]);
    }

    public function testGetTechnicians(): void
    {
        $Event = $this->model::find(1);
        $results = $Event->technicians;
        $this->assertCount(2, $results);
        $expected = [
            [
                'id' => 1,
                'first_name' => 'Jean',
                'last_name' => 'Fountain',
                'phone' => null,
                'nickname' => null,
                'full_name' => 'Jean Fountain',
                'country' => null,
                'company' => null,
                'pivot' => [
                    'id' => 1,
                    'event_id' => 1,
                    'technician_id' => 1,
                    'start_time' => '2018-12-17 09:00:00',
                    'end_time' => '2018-12-18 22:00:00',
                    'position' => 'Régisseur',
                ]
            ],
            [
                'id' => 2,
                'first_name' => 'Roger',
                'last_name' => 'Rabbit',
                'phone' => null,
                'nickname' => 'Riri',
                'full_name' => 'Roger Rabbit',
                'country' => null,
                'company' => null,
                'pivot' => [
                    'id' => 2,
                    'event_id' => 1,
                    'technician_id' => 2,
                    'start_time' => '2018-12-18 14:00:00',
                    'end_time' => '2018-12-18 18:00:00',
                    'position' => 'Technicien plateau',
                ]
            ],
        ];
        $this->assertEquals($expected, $results);
    }

    public function testGetBeneficiaries(): void
    {
        $Event = $this->model::find(1);
        $results = $Event->beneficiaries;
        $this->assertEquals([
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
                'pivot' => ['event_id' => 1, 'person_id' => 3],
            ]
        ], $results);
    }

    public function testGetUser()
    {
        $Event = $this->model::find(1);
        $results = $Event->user;
        $expected = [
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
        ];
        $this->assertEquals($expected, $results);
    }

    public function testGetEstimates()
    {
        $Event = $this->model::find(1);
        $results = $Event->estimates;
        $expected = [
            [
                'id' => 1,
                'date' => '2021-01-30 14:00:00',
                'discount_rate' => 50.0,
                'due_amount' => 325.5,
            ]
        ];
        $this->assertEquals($expected, $results->toArray());
    }

    public function testGetBills()
    {
        $Event = $this->model::find(1);
        $results = $Event->bills;
        $expected = [
            [
                'id' => 1,
                'number' => '2020-00001',
                'date' => '2020-01-30 14:00:00',
                'discount_rate' => 50.0,
                'due_amount' => 325.5,
            ]
        ];
        $this->assertEquals($expected, $results);
    }

    public function testSetPeriod()
    {
        // - Set period to current year
        $this->model->setPeriod(null, null);
        $results = $this->model->getAll()->get()->toArray();
        $this->assertCount(0, $results);

        // - Set period to 2018
        $this->model->setPeriod('2018-01-01', '2018-12-31');
        $results = $this->model->getAll()->get()->toArray();
        $this->assertCount(3, $results);
        $this->assertEquals('Avant-premier événement', $results[0]['title']);

        // - Set period to last dec. 2018
        $this->model->setPeriod('2018-12-19', '2018-12-31');
        $results = $this->model->getAll()->get()->toArray();
        $this->assertCount(1, $results);
        $this->assertEquals('Second événement', $results[0]['title']);
    }

    public function testValidateEventDates(): void
    {
        $data = [
            'user_id' => 1,
            'title' => "Test dates validation",
            'start_date' => '2020-03-01 00:00:00',
            'is_confirmed' => false,
        ];

        // - Validation pass: dates are OK
        $testData = array_merge(
            $data,
            ['end_date' => '2020-03-03 23:59:59']
        );
        (new Event($testData))->validate();

        // - Validation fail: end date is after start date
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $testData = array_merge(
            $data,
            ['end_date' => '2020-02-20 23:59:59']
        );
        (new Event($testData))->validate();
    }

    public function testValidateIsArchived(): void
    {
        $dataClose = [
            'user_id' => 1,
            'title' => "Test is_archived validation",
            'start_date' => '2020-03-01 00:00:00',
            'end_date' => '2020-03-03 23:59:59',
            'is_confirmed' => false,
        ];

        // - Validation pass: event has a return inventory
        $testData = array_merge($dataClose, [
            'is_return_inventory_done' => true,
            'is_archived' => true,
        ]);
        (new Event($testData))->validate();

        // - Validation pass: event is not archived
        $testData = array_merge($dataClose, [
            'is_return_inventory_done' => true,
            'is_archived' => false,
        ]);
        (new Event($testData))->validate();

        // - Validation fails: event hos no return inventory
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $testData = array_merge($dataClose, [
            'is_return_inventory_done' => false,
            'is_archived' => true,
        ]);
        (new Event($testData))->validate();
    }

    public function testValidateIsArchivedNotPast(): void
    {
        // - Validation fails: event is not past
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $currentEvent = [
            'user_id' => 1,
            'title' => "Test is_archive validation failure",
            'start_date' => '2120-03-01 00:00:00',
            'end_date' => '2120-03-03 23:59:59',
            'is_confirmed' => true,
            'is_archived' => true,
        ];
        (new Event($currentEvent))->validate();
    }

    public function testValidateReference(): void
    {
        $data = [
            'user_id' => 1,
            'title' => "Test dates validation",
            'start_date' => '2020-03-01 00:00:00',
            'end_date' => '2020-03-03 23:59:59',
            'is_confirmed' => false,
        ];

        foreach (['REF1', null] as $testValue) {
            $testData = array_merge($data, ['reference' => $testValue]);
            (new Event($testData))->validate();
        }

        // - Validation fail: Reference is an empty string
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $testData = array_merge($data, ['reference' => '']);
        (new Event($testData))->validate();
    }

    public function testGetPdfContent()
    {
        $result = $this->model->getPdfContent(1);
        $this->assertNotEmpty($result);
    }

    public function testSaveRelations()
    {
        $data = [
            'beneficiaries' => [3],
        ];

        $event = Event::findOrFail(3);
        $event->saveRelations($data);
        $this->assertEquals(1, count($event->beneficiaries));
        $this->assertEquals('Client Benef', $event->beneficiaries[0]['full_name']);

        $data = [
            'technicians' => [
                [
                    'id' => 1,
                    'start_time' => '2018-12-15 10:00:00',
                    'end_time' => '2018-12-16 19:00:00',
                    'position' => ' Testeur ',
                ],
            ],
        ];
        $event->saveRelations($data);
        $this->assertEquals(1, count($event->technicians));
        $this->assertEquals('Jean Fountain', $event->technicians[0]['full_name']);
        $this->assertEquals('2018-12-15 10:00:00', $event->technicians[0]['pivot']['start_time']);
        $this->assertEquals('2018-12-16 19:00:00', $event->technicians[0]['pivot']['end_time']);
        $this->assertEquals('Testeur', $event->technicians[0]['pivot']['position']);

        $data = [
            'materials' => [
                [ 'id' => 3, 'quantity' => 20 ],
                [ 'id' => 2, 'quantity' => 3 ],
                [ 'id' => 5, 'quantity' => 14 ],
                [ 'id' => 1, 'quantity' => 8 ],
            ],
        ];
        $event->saveRelations($data);
        $this->assertEquals(4, count($event->materials));
        $this->assertEquals(1, $event->materials[0]['id']);
        $this->assertEquals(8, $event->materials[0]['pivot']['quantity']);
        $this->assertEquals(5, $event->materials[1]['id']);
        $this->assertEquals(14, $event->materials[1]['pivot']['quantity']);
        $this->assertEquals(2, $event->materials[2]['id']);
        $this->assertEquals(3, $event->materials[2]['pivot']['quantity']);
        $this->assertEquals(3, $event->materials[3]['id']);
        $this->assertEquals(20, $event->materials[3]['pivot']['quantity']);
    }

    public function testSyncTechnicians()
    {
        $technicians = [
            [
                'id' => 1,
                'start_time' => '2018-12-15 10:00:00',
                'end_time' => '2018-12-16 19:00:00',
                'position' => ' Testeur ',
            ],
            [
                'id' => 2,
                'start_time' => '2018-12-15 10:00:00',
                'end_time' => '2018-12-15 16:00:00',
                'position' => 'Stagiaire observateur',
            ],
        ];
        $event = Event::findOrFail(3);
        $event->syncTechnicians($technicians);
        $this->assertEquals(2, count($event->technicians));
        $this->assertEquals('Jean Fountain', $event->technicians[0]['full_name']);
        $this->assertEquals('2018-12-15 10:00:00', $event->technicians[0]['pivot']['start_time']);
        $this->assertEquals('2018-12-16 19:00:00', $event->technicians[0]['pivot']['end_time']);
        $this->assertEquals('Testeur', $event->technicians[0]['pivot']['position']);
        $this->assertEquals('Roger Rabbit', $event->technicians[1]['full_name']);
        $this->assertEquals('2018-12-15 10:00:00', $event->technicians[1]['pivot']['start_time']);
        $this->assertEquals('2018-12-15 16:00:00', $event->technicians[1]['pivot']['end_time']);
        $this->assertEquals('Stagiaire observateur', $event->technicians[1]['pivot']['position']);
    }

    public function testSyncMaterials()
    {
        $materials = [
            [ 'id' => 3, 'quantity' => 20 ],
            [ 'id' => 2, 'quantity' => 3 ],
            [ 'id' => 5, 'quantity' => 14 ],
            [ 'id' => 1, 'quantity' => 8 ],
        ];
        $event = Event::findOrFail(3);
        $event->syncMaterials($materials);
        $this->assertEquals(4, count($event->materials));
        $this->assertEquals(1, $event->materials[0]['id']);
        $this->assertEquals(8, $event->materials[0]['pivot']['quantity']);
        $this->assertEquals(5, $event->materials[1]['id']);
        $this->assertEquals(14, $event->materials[1]['pivot']['quantity']);
        $this->assertEquals(2, $event->materials[2]['id']);
        $this->assertEquals(3, $event->materials[2]['pivot']['quantity']);
        $this->assertEquals(3, $event->materials[3]['id']);
        $this->assertEquals(20, $event->materials[3]['pivot']['quantity']);
    }
}
