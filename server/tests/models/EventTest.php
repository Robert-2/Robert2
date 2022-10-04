<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Errors;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Event;

final class EventTest extends TestCase
{
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
            (new Event)->getAll()->get()->toArray()
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
        $this->assertTrue($result->isEmpty());

        // - Get missing materials of event #1
        $result = Event::find(1)->missingMaterials();
        $this->assertCount(1, $result);
        $this->assertEquals('DBXPA2', $result->get(0)['reference']);
        $this->assertEquals(1, $result->get(0)['missing_quantity']);
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

    public function testDailyAmount()
    {
        $this->assertEquals(341.45, Event::find(1)->daily_amount);
    }

    public function testDiscountableDailyAmount()
    {
        $this->assertEquals(41.45, Event::find(1)->discountable_daily_amount);
    }

    public function testReplacementAmount()
    {
        $this->assertEquals(19808.9, Event::find(1)->replacement_amount);
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
        $this->assertEquals([2], $result);

        // - Event with material from two parks
        $result = Event::getParks(4);
        $this->assertEquals([2, 1], $result);

        // - Event without material (so without park)
        $result = Event::getParks(6);
        $this->assertEquals([], $result);
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
        $result = (new Event)->getPdfContent(1);
        $this->assertMatchesHtmlSnapshot($result);

        $result = (new Event)->getPdfContent(2);
        $this->assertMatchesHtmlSnapshot($result);
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
        $this->assertEquals('Jean Technicien', $event->technicians[0]['technician']['full_name']);
        $this->assertEquals('2018-12-15 09:00:00', $event->technicians[0]['start_time']);
        $this->assertEquals('2018-12-15 16:00:00', $event->technicians[0]['end_time']);
        $this->assertEquals('Stagiaire observateur', $event->technicians[0]['position']);
        $this->assertEquals('Roger Rabbit', $event->technicians[1]['technician']['full_name']);
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
        $this->assertEquals('Roger Rabbit', $event->technicians[0]['technician']['full_name']);
        $this->assertEquals('2019-03-01 08:00:00', $event->technicians[0]['start_time']);
        $this->assertEquals('2019-03-01 20:00:00', $event->technicians[0]['end_time']);
        $this->assertEquals('Roadie déballage', $event->technicians[0]['position']);
        $this->assertEquals('Jean Technicien', $event->technicians[1]['technician']['full_name']);
        $this->assertEquals('2019-03-02 10:00:00', $event->technicians[1]['start_time']);
        $this->assertEquals('2019-04-09 17:00:00', $event->technicians[1]['end_time']);
        $this->assertEquals('Régisseur', $event->technicians[1]['position']);
        $this->assertEquals('Roger Rabbit', $event->technicians[2]['technician']['full_name']);
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
            'reference' => null,
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

        $newEventData = $newEvent->setAppends([])->attributesToArray();
        unset(
            $newEventData['created_at'],
            $newEventData['updated_at'],
            $newEventData['deleted_at']
        );

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
        $this->assertEquals('Roger Rabbit', $newEvent->technicians[0]['technician']['full_name']);
        $this->assertEquals('2021-08-01 09:00:00', $newEvent->technicians[0]['start_time']);
        $this->assertEquals('2021-08-02 22:00:00', $newEvent->technicians[0]['end_time']);
        $this->assertEquals('Jean Technicien', $newEvent->technicians[1]['technician']['full_name']);
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
        $this->assertEquals('Roger Rabbit', $newEvent->technicians[0]['technician']['full_name']);
        $this->assertEquals('2021-08-01 09:00:00', $newEvent->technicians[0]['start_time']);
        $this->assertEquals('2021-08-01 23:45:00', $newEvent->technicians[0]['end_time']);
    }

    public function testChangeDatesLonger()
    {
        $event = Event::staticEdit(1, [
            'end_date' => '2018-12-19 23:59:59', // - Un jour de plus
        ]);
        $this->assertCount(2, $event->technicians);
        $this->assertEquals('Roger Rabbit', $event->technicians[0]['technician']['full_name']);
        $this->assertEquals('2018-12-17 09:00:00', $event->technicians[0]['start_time']);
        $this->assertEquals('2018-12-18 22:00:00', $event->technicians[0]['end_time']);
        $this->assertEquals('Jean Technicien', $event->technicians[1]['technician']['full_name']);
        $this->assertEquals('2018-12-18 14:00:00', $event->technicians[1]['start_time']);
        $this->assertEquals('2018-12-18 18:00:00', $event->technicians[1]['end_time']);
    }

    public function testChangeDatesHalfTime()
    {
        $event = Event::staticEdit(1, [
            'end_date' => '2018-12-17 23:59:59', // - Un jour de moins
        ]);
        $this->assertCount(1, $event->technicians);
        $this->assertEquals('Roger Rabbit', $event->technicians[0]['technician']['full_name']);
        $this->assertEquals('2018-12-17 09:00:00', $event->technicians[0]['start_time']);
        $this->assertEquals('2018-12-17 23:45:00', $event->technicians[0]['end_time']);
    }

    public function testGetAllNotReturned(): void
    {
        $minDate = '2018-01-01';

        // - Test à une date qui contient un événement avec inventaire fait (#1)
        $this->assertEmpty(Event::getAllNotReturned('2018-12-18', $minDate)->get()->toArray());

        // - Test à une date qui contient un événement  l'inventaire n'est pas terminé,
        //   mais qui est archivé (#3)
        $this->assertEmpty(Event::getAllNotReturned('2018-12-16', $minDate)->get()->toArray());

        // - Test à une date qui contient un événement dont l'inventaire n'est pas terminé,
        //   et qui n'est pas archivé (#4)
        $results = Event::getAllNotReturned('2019-04-10', $minDate)->get()->toArray();
        $this->assertCount(1, $results);
        $this->assertEquals(4, $results[0]['id']);
        $this->assertEquals('Concert X', $results[0]['title']);
        $this->assertEquals('2019-04-10 23:59:59', $results[0]['end_date']);

        // - Test à une date qui contient un événement non-archivé, avec inventaire non terminé,
        //   en incluant tous les événements précédents jusqu'à la date $minDate
        $results = Event::getAllNotReturned('2020-01-01', $minDate, 'withPrevious')->get()->toArray();
        $this->assertCount(2, $results);
        $this->assertEquals(4, $results[0]['id']);
        $this->assertEquals('Concert X', $results[0]['title']);
        $this->assertEquals(5, $results[1]['id']);
        $this->assertEquals('Kermesse de l\'école des trois cailloux', $results[1]['title']);

        // - Test à une date qui contient un événement dont l'inventaire n'est pas terminé,
        //   mais avec une date minimum plus récente
        $this->assertEmpty(Event::getAllNotReturned('2019-04-10', '2021-01-01')->get()->toArray());

        // - Test avec des valeurs non valides
        try {
            Event::getAllNotReturned('', '2021-01-01')->get()->toArray();
        } catch (\InvalidArgumentException $e) {
            $this->assertEquals("La date de fin à utiliser n'est pas valide.", $e->getMessage());
        }

        try {
            Event::getAllNotReturned('not-a-date', '2021-01-01')->get()->toArray();
        } catch (\InvalidArgumentException $e) {
            $this->assertEquals("La date de fin à utiliser n'est pas valide.", $e->getMessage());
        }

        try {
            Event::getAllNotReturned('2019-04-10', '')->get()->toArray();
        } catch (\InvalidArgumentException $e) {
            $this->assertEquals("La date minimale à utiliser n'est pas valide.", $e->getMessage());
        }

        try {
            Event::getAllNotReturned('2019-04-10', 'not-a-date')->get()->toArray();
        } catch (\InvalidArgumentException $e) {
            $this->assertEquals("La date minimale à utiliser n'est pas valide.", $e->getMessage());
        }
    }
}
