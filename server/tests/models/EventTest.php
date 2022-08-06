<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Errors;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Enums\Group;
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
        // Préparation:
        // - On s'assure qu'il n'y a aucun événement dans l'année courante.
        // - On fait en sorte que l'événement 3 se produise entre aujourd'hui et demain.
        foreach (Event::all() as $event) {
            $currentYear = date('Y');

            $start = new \Datetime($event->start_date);
            if ($start->format('Y') === $currentYear) {
                $start->add(new \DateInterval('P1Y'));
            }

            $end = new \Datetime($event->end_date);
            if ($end->format('Y') === $currentYear) {
                $end->add(new \DateInterval('P1Y'));
            }

            $event->update([
                'start_date' => $start->format('Y-m-d 00:00:00'),
                'end_date' => $end->format('Y-m-d 23:59:59'),
            ]);
        }
        $today = (new \Datetime)->format('Y-m-d 00:00:00');
        $tomorrow = (new \Datetime('tomorrow'))->format('Y-m-d 23:59:59');
        Event::where('id', 3)->update(['start_date' => $today, 'end_date' => $tomorrow]);

        // - La méthode `getAll` ne doit retourner que les événements dans l'année courante.
        $results = array_map(
            function ($result) {
                unset($result['created_at'], $result['updated_at']);
                return $result;
            },
            $this->model->getAll()->get()->toArray()
        );
        $expected = [
            [
                'id' => 3,
                'user_id' => 1,
                'title' => "Avant-premier événement",
                'description' => null,
                'reference' => null,
                'start_date' => $today,
                'end_date' => $tomorrow,
                'is_confirmed' => false,
                'is_archived' => true,
                'location' => "Brousse",
                'is_billable' => false,
                'is_return_inventory_done' => true,
                'deleted_at' => null,
            ],
        ];
        $this->assertEquals($expected, $results);
    }

    public function testInPeriodScope(): void
    {
        // - Récupère les événements de 2018
        $result = Event::inPeriod('2018-01-01', '2018-12-31')->get();
        $expected = [
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
        ];
        $this->assertCount(3, $result);
        $this->assertEquals($expected, $result->toArray());

        // - Récupère les événements de la fin décembre 2018.
        $results = Event::inPeriod('2018-12-19', '2018-12-31')->get();
        $this->assertCount(1, $results);
        $this->assertEquals(2, $results[0]->id);

        // - Récupère les événements d'une journée si un seul argument est passé.
        $results = Event::inPeriod('2018-12-15')->get();
        $this->assertCount(1, $results);
        $this->assertEquals(3, $results[0]->id);

        // - Doit accepter les formats relatifs.
        $results = Event::inPeriod('first day of December 2018', 'third sat of December 2018')->get();
        $this->assertCount(1, $results);
        $this->assertEquals(3, $results[0]->id);
    }

    public function testMissingMaterials(): void
    {
        // - No missing materials for event #3
        $result = Event::find(3)->missingMaterials();
        $this->assertNull($result);

        // - Get missing materials of event #1
        $result = Event::find(1)->missingMaterials();
        $this->assertNotNull($result);
        $this->assertCount(1, $result);
        $this->assertEquals('DBXPA2', $result[0]['reference']);
        $this->assertEquals(1, $result[0]['missing_quantity']);

        // - Get missing materials of event #4
        $result = Event::find(4)->missingMaterials();
        $this->assertNotNull($result);
        $this->assertCount(2, $result);
        $this->assertEquals('Transporter', $result[0]['reference']);
        $this->assertEquals(3, $result[0]['missing_quantity']);
    }

    public function testHasMissingMaterials(): void
    {
        // - L'événement #4 contient du matériel manquant.
        $result = Event::find(1)
            ->fill(['end_date' => (new \Datetime('tomorrow'))->format('Y-m-d H:i:s')])
            ->setAppends(['has_missing_materials']);
        $this->assertSame(true, $result->hasMissingMaterials);

        // - L'événement #3 est archivé, pas de calcul du matériel manquant.
        $result = Event::find(3)
            ->fill([
                'start_date' => (new \Datetime)->format('Y-m-d H:i:s'),
                'end_date' => (new \Datetime('tomorrow'))->format('Y-m-d H:i:s'),
            ])
            ->setAppends(['has_missing_materials']);
        $this->assertSame(null, $result->hasMissingMaterials);

        // - L'événement #3 lorsqu'il est désarchivé, ne contient pas de matériel manquant.
        $result = Event::find(3)
            ->fill([
                'is_archived' => false,
                'start_date' => (new \Datetime)->format('Y-m-d H:i:s'),
                'end_date' => (new \Datetime('tomorrow'))->format('Y-m-d H:i:s'),
            ])
            ->setAppends(['has_missing_materials']);
        $this->assertSame(false, $result->hasMissingMaterials);
    }

    public function testHasNotReturnedMaterials(): void
    {
        // - Event #1 does not have material not returned
        $result = Event::find(1)->setAppends(['has_not_returned_materials']);
        $this->assertSame(false, $result->hasNotReturnedMaterials);

        // - Event #2 have some materials not returned
        $result = Event::find(2)->setAppends(['has_not_returned_materials']);
        $this->assertSame(true, $result->hasNotReturnedMaterials);

        // - L'événement #3 est archivé, pas de calcul du matériel non retourné.
        $result = Event::find(3)->setAppends(['has_not_returned_materials']);
        $this->assertSame(null, $result->hasNotReturnedMaterials);
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
                'event_id' => 1,
                'technician_id' => 1,
                'start_time' => '2018-12-17 09:00:00',
                'end_time' => '2018-12-18 22:00:00',
                'position' => 'Régisseur',
                'technician' => [
                    'id' => 1,
                    'first_name' => 'Jean',
                    'last_name' => 'Fountain',
                    'phone' => null,
                    'nickname' => null,
                    'full_name' => 'Jean Fountain',
                    'country' => null,
                    'full_address' => null,
                    'company' => null,
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
                    'phone' => null,
                    'nickname' => 'Riri',
                    'full_name' => 'Roger Rabbit',
                    'country' => null,
                    'full_address' => null,
                    'company' => null,
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
                'email' => 'client@beneficiaires.com',
                'street' => '156 bis, avenue des tests poussés',
                'postal_code' => '88080',
                'locality' => 'Wazzaville',
                'company_id' => null,
                'company' => null,
                'country' => null,
                'full_address' => "156 bis, avenue des tests poussés\n88080 Wazzaville",
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
            'group' => Group::ADMIN,
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
                'full_address' => "1, somewhere av.\n1234 Megacity",
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
                    'full_address' => "1, company st.\n1234 Megacity",
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

    public function testAddSearch()
    {
        // - Retourne les événement qui ont le terme "premier" dans le titre
        $results = (new Event)->addSearch('premier')
            ->select(['id', 'title'])
            ->get();
        $this->assertEquals([
            ['id' => 1, 'title' => 'Premier événement'],
            ['id' => 3, 'title' => 'Avant-premier événement'],
        ], $results->toArray());

        // - Retourne les événements qui ont le terme "Lyon" dans la localisation
        $results = (new Event)->addSearch('Lyon', ['location'])
            ->select(['id', 'title', 'location'])
            ->get();
        $this->assertEquals([
            [
                'id' => 2,
                'title' => 'Second événement',
                'location' => 'Lyon',
            ],
        ], $results->toArray());

        // - Retourne les événements qui ont le terme "ou" dans le titre ou la localisation
        $results = (new Event)->addSearch('ou', ['title', 'location'])
            ->select(['id', 'title', 'location'])
            ->get();
        $this->assertEquals([
            [
                'id' => 3,
                'title' => 'Avant-premier événement',
                'location' => 'Brousse',
            ],
            [
                'id' => 5,
                'title' => "Kermesse de l'école des trois cailloux",
                'location' => 'Saint-Jean-la-Forêt',
            ],
        ], $results->toArray());
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

        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $testData = array_merge($data, ['reference' => 'forb1dden-ch@rs']);
        (new Event($testData))->validate();
    }

    public function testGetPdfContent()
    {
        $result = $this->model->getPdfContent(1);
        $this->assertNotEmpty($result);
    }

    public function testStaticEdit()
    {
        $data = [
            'title' => ' Test update ',
            'description' => '',
            'is_archived' => false,
            'beneficiaries' => [3],
            'technicians' => [
                [
                    'id' => 1,
                    'start_time' => '2018-12-15 10:00:00',
                    'end_time' => '2018-12-16 19:00:00',
                    'position' => ' Testeur ',
                ],
                [
                    'id' => 2,
                    'start_time' => '2018-12-15 09:00:00',
                    'end_time' => '2018-12-15 16:00:00',
                    'position' => 'Stagiaire observateur',
                ],
            ],
            'materials' => [
                [ 'id' => 3, 'quantity' => 20 ],
                [ 'id' => 2, 'quantity' => 3 ],
                [ 'id' => 5, 'quantity' => 14 ],
                [ 'id' => 1, 'quantity' => 8 ],
            ],
        ];

        $event = Event::staticEdit(3, $data);
        $this->assertEquals(3, $event->id);
        $this->assertEquals('Test update', $event->title);
        $this->assertNull($event->description);

        $this->assertEquals(1, count($event->beneficiaries));
        $this->assertEquals('Client Benef', $event->beneficiaries[0]['full_name']);

        $this->assertEquals(2, count($event->technicians));
        $this->assertEquals('Roger Rabbit', $event->technicians[0]['technician']['full_name']);
        $this->assertEquals('2018-12-15 09:00:00', $event->technicians[0]['start_time']);
        $this->assertEquals('2018-12-15 16:00:00', $event->technicians[0]['end_time']);
        $this->assertEquals('Stagiaire observateur', $event->technicians[0]['position']);
        $this->assertEquals('Jean Fountain', $event->technicians[1]['technician']['full_name']);
        $this->assertEquals('2018-12-15 10:00:00', $event->technicians[1]['start_time']);
        $this->assertEquals('2018-12-16 19:00:00', $event->technicians[1]['end_time']);
        $this->assertEquals('Testeur', $event->technicians[1]['position']);

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

    public function testStaticEditBadBeneficiaries()
    {
        $data = ['beneficiaries' => 'not_an_array'];
        $this->expectException(\InvalidArgumentException::class);
        Event::staticEdit(4, $data);
    }

    public function testStaticEditBadTechnicians()
    {
        $data = ['technicians' => 'not_an_array'];
        $this->expectException(\InvalidArgumentException::class);
        Event::staticEdit(4, $data);
    }

    public function testStaticEditBadMaterials()
    {
        $data = ['materials' => 'not_an_array'];
        $this->expectException(\InvalidArgumentException::class);
        Event::staticEdit(4, $data);
    }

    public function testSyncBeneficiaries()
    {
        $beneficiaries = [2, 3];
        $event = Event::findOrFail(4);
        $event->syncBeneficiaries($beneficiaries);
        $this->assertEquals(2, count($event->beneficiaries));
        $this->assertEquals('Client Benef', $event->beneficiaries[0]['full_name']);
        $this->assertEquals('Roger Rabbit', $event->beneficiaries[1]['full_name']);
    }

    public function testSyncTechnicians()
    {
        $technicians = [
            [
                'id' => 1,
                'start_time' => '2019-03-01 08:00:00',
                'end_time' => '2019-03-01 20:00:00',
                'position' => 'Roadie déballage',
            ],
            [
                'id' => 1,
                'start_time' => '2019-04-10 08:00:00',
                'end_time' => '2019-04-10 20:00:00',
                'position' => 'Roadie remballage',
            ],
            [
                'id' => 2,
                'start_time' => '2019-03-02 10:00:00',
                'end_time' => '2019-04-09 17:00:00',
                'position' => 'Régisseur',
            ],
        ];
        $event = Event::findOrFail(4);
        $event->syncTechnicians($technicians);
        $this->assertEquals(3, count($event->technicians));
        $this->assertEquals('Jean Fountain', $event->technicians[0]['technician']['full_name']);
        $this->assertEquals('2019-03-01 08:00:00', $event->technicians[0]['start_time']);
        $this->assertEquals('2019-03-01 20:00:00', $event->technicians[0]['end_time']);
        $this->assertEquals('Roadie déballage', $event->technicians[0]['position']);
        $this->assertEquals('Roger Rabbit', $event->technicians[1]['technician']['full_name']);
        $this->assertEquals('2019-03-02 10:00:00', $event->technicians[1]['start_time']);
        $this->assertEquals('2019-04-09 17:00:00', $event->technicians[1]['end_time']);
        $this->assertEquals('Régisseur', $event->technicians[1]['position']);
        $this->assertEquals('Jean Fountain', $event->technicians[2]['technician']['full_name']);
        $this->assertEquals('2019-04-10 08:00:00', $event->technicians[2]['start_time']);
        $this->assertEquals('2019-04-10 20:00:00', $event->technicians[2]['end_time']);
        $this->assertEquals('Roadie remballage', $event->technicians[2]['position']);
    }

    public function testSyncTechniciansValidationErrors()
    {
        $technicians = [
            [
                'id' => 1,
                'start_time' => '2019-03-02 08:00:00',
                'end_time' => '2019-03-01 20:00:00',
                'position' => 'Roadie déballage',
            ],
            [
                'id' => 2,
                'start_time' => '2019-04-10 10:00:00',
                'end_time' => '2019-04-11 17:00:00',
                'position' => 'Régisseur',
            ],
        ];
        $event = Event::findOrFail(4);

        $errors = null;
        try {
            $event->syncTechnicians($technicians);
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }

        $expectedErrors = [
            1 => [
                'start_time' => ['End date must be later than start date'],
                'end_time' => ['End date must be later than start date'],
            ],
            2 => [
                'start_time' => ['Assignment of this technician ends after the event.'],
                'end_time' => ['Assignment of this technician ends after the event.'],
            ],
        ];
        $this->assertEquals($expectedErrors, $errors);
    }

    public function testSyncMaterials()
    {
        $materials = [
            [ 'id' => 2, 'quantity' => 4 ],
            [ 'id' => 1, 'quantity' => 7 ],
        ];
        $event = Event::findOrFail(4);
        $event->syncMaterials($materials);
        $this->assertEquals(2, count($event->materials));
        $this->assertEquals(2, $event->materials[0]['id']);
        $this->assertEquals(4, $event->materials[0]['pivot']['quantity']);
        $this->assertEquals(1, $event->materials[1]['id']);
        $this->assertEquals(7, $event->materials[1]['pivot']['quantity']);
    }

    public function testDuplicateNotFound()
    {
        $this->expectException(ModelNotFoundException::class);
        Event::duplicate(999, []);
    }

    public function testDuplicateBadData()
    {
        $newEventData = ['user_id' => 1];
        $this->expectException(ValidationException::class);
        Event::duplicate(1, $newEventData);
    }

    public function testDuplicate()
    {
        $newEventData = [
            'user_id' => 1,
            'start_date' => '2021-08-01 00:00:00',
            'end_date' => '2021-08-02 23:59:59',
        ];
        $newEvent = Event::duplicate(1, $newEventData);
        $expected = [
            'id' => 7,
            'user_id' => 1,
            'title' => 'Premier événement',
            'description' => null,
            'start_date' => '2021-08-01 00:00:00',
            'end_date' => '2021-08-02 23:59:59',
            'is_confirmed' => false,
            'is_archived' => false,
            'location' => 'Gap',
            'is_billable' => true,
            'is_return_inventory_done' => false,
        ];
        $newEventData = $newEvent->toArray();
        unset($newEventData['created_at']);
        unset($newEventData['updated_at']);
        $this->assertEquals($expected, $newEventData);
        $this->assertCount(1, $newEvent->beneficiaries);
        $this->assertCount(2, $newEvent->technicians);
        $this->assertCount(3, $newEvent->materials);
    }

    public function testDuplicateLonger()
    {
        $newEventData = [
            'user_id' => 1,
            'start_date' => '2021-08-01 00:00:00',
            'end_date' => '2021-08-03 23:59:59', // - Un jour de plus que l'original
        ];
        $newEvent = Event::duplicate(1, $newEventData);
        $this->assertCount(2, $newEvent->technicians);
        $this->assertEquals('Jean Fountain', $newEvent->technicians[0]['technician']['full_name']);
        $this->assertEquals('2021-08-01 09:00:00', $newEvent->technicians[0]['start_time']);
        $this->assertEquals('2021-08-02 22:00:00', $newEvent->technicians[0]['end_time']);
        $this->assertEquals('Roger Rabbit', $newEvent->technicians[1]['technician']['full_name']);
        $this->assertEquals('2021-08-02 14:00:00', $newEvent->technicians[1]['start_time']);
        $this->assertEquals('2021-08-02 18:00:00', $newEvent->technicians[1]['end_time']);
    }

    public function testDuplicateHalfTime()
    {
        $newEventData = [
            'user_id' => 1,
            'start_date' => '2021-08-01 00:00:00',
            'end_date' => '2021-08-01 23:59:59', // - Un jour de moins que l'original
        ];
        $newEvent = Event::duplicate(1, $newEventData);
        $this->assertCount(1, $newEvent->technicians);
        $this->assertEquals('Jean Fountain', $newEvent->technicians[0]['technician']['full_name']);
        $this->assertEquals('2021-08-01 09:00:00', $newEvent->technicians[0]['start_time']);
        $this->assertEquals('2021-08-01 23:45:00', $newEvent->technicians[0]['end_time']);
    }

    public function testChangeDatesLonger()
    {
        $event = Event::staticEdit(1, [
            'end_date' => '2018-12-19 23:59:59', // - Un jour de plus
        ]);
        $this->assertCount(2, $event->technicians);
        $this->assertEquals('Jean Fountain', $event->technicians[0]['technician']['full_name']);
        $this->assertEquals('2018-12-17 09:00:00', $event->technicians[0]['start_time']);
        $this->assertEquals('2018-12-18 22:00:00', $event->technicians[0]['end_time']);
        $this->assertEquals('Roger Rabbit', $event->technicians[1]['technician']['full_name']);
        $this->assertEquals('2018-12-18 14:00:00', $event->technicians[1]['start_time']);
        $this->assertEquals('2018-12-18 18:00:00', $event->technicians[1]['end_time']);
    }

    public function testChangeDatesHalfTime()
    {
        $event = Event::staticEdit(1, [
            'end_date' => '2018-12-17 23:59:59', // - Un jour de moins
        ]);
        $this->assertCount(1, $event->technicians);
        $this->assertEquals('Jean Fountain', $event->technicians[0]['technician']['full_name']);
        $this->assertEquals('2018-12-17 09:00:00', $event->technicians[0]['start_time']);
        $this->assertEquals('2018-12-17 23:45:00', $event->technicians[0]['end_time']);
    }
}
