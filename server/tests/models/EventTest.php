<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Support\Carbon;
use Robert2\API\Errors\Exception\ValidationException;
use Robert2\API\Models\Event;
use Robert2\API\Models\Technician;
use Robert2\API\Models\User;
use Robert2\API\Services\I18n;
use Robert2\Support\Pdf;
use Robert2\Support\Period;

final class EventTest extends TestCase
{
    public function testGetAll(): void
    {
        Carbon::setTestNow(Carbon::create(2020, 06, 15, 12, 0, 0));

        // - La méthode `getAll` ne doit retourner que les événements dans l'année courante.
        $expected = [
            [
                'id' => 5,
                'user_id' => 1,
                'title' => "Kermesse de l'école des trois cailloux",
                'description' => null,
                'reference' => null,
                'start_date' => '2020-01-01 00:00:00',
                'end_date' => '2020-01-01 23:59:59',
                'is_confirmed' => false,
                'is_archived' => false,
                'location' => "Saint-Jean-la-Forêt",
                'is_billable' => false,
                'is_return_inventory_done' => false,
                'created_at' => '2019-12-25 14:59:40',
                'updated_at' => null,
                'deleted_at' => null,
            ],
        ];
        $results = (new Event)->getAll()->get()->toArray();
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
                'created_at' => '2018-12-14 12:20:00',
                'updated_at' => '2018-12-14 12:30:00',
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
                'created_at' => '2018-12-01 12:50:45',
                'updated_at' => '2018-12-05 08:31:21',
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
                'created_at' => '2018-12-16 12:50:45',
                'updated_at' => null,
                'deleted_at' => null,
            ],
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

    public function testSearchScope()
    {
        // - Retourne les événement qui ont le terme "premier" dans le titre
        $this->assertEquals(
            [
                ['id' => 1, 'title' => 'Premier événement'],
                ['id' => 3, 'title' => 'Avant-premier événement'],
            ],
            Event::search('premier')
                ->select(['id', 'title'])
                ->get()->toArray(),
        );
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
        $this->assertEquals(1, $result->get(0)['pivot']['quantity_missing']);

        // - Get missing materials of event #4
        $result = Event::find(4)->missingMaterials();
        $this->assertCount(2, $result);
        $this->assertEquals('XR18', $result->get(0)['reference']);
        $this->assertEquals(2, $result->get(0)['pivot']['quantity_missing']);
        $this->assertEquals('Transporter', $result->get(1)['reference']);
        $this->assertEquals(2, $result->get(1)['pivot']['quantity_missing']);

        // - Get missing materials of event #5
        $result = Event::find(5)->missingMaterials();
        $this->assertCount(1, $result);
        $this->assertEquals('Decor-Forest', $result->get(0)['reference']);
        $this->assertEquals(1, $result->get(0)['pivot']['quantity_missing']);
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

    public function testDailyAmountWithoutDiscount()
    {
        $this->assertEquals('341.45', (string) Event::find(1)->daily_total_without_discount);
    }

    public function testDailyTotalDiscountable()
    {
        $this->assertEquals('41.45', (string) Event::find(1)->daily_total_discountable);
    }

    public function testTotalReplacement()
    {
        $this->assertEquals('19808.90', (string) Event::find(1)->total_replacement);
    }

    public function testGetParksAttribute(): void
    {
        // - Events qui ont du matériel dans un seul parc
        foreach ([1, 2, 3] as $eventId) {
            $event = Event::find($eventId);
            $this->assertEquals([1], $event->parks);
        }

        // - Event qui a du matériel dans deux parcs
        $event = Event::find(4);
        $this->assertEquals([1, 2], $event->parks);

        // - Event sans matériel
        $event = Event::find(6);
        $this->assertEquals([], $event->parks);
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
        $this->expectException(ValidationException::class);
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
        $this->expectException(ValidationException::class);
        $testData = array_merge($dataClose, [
            'is_return_inventory_done' => false,
            'is_archived' => true,
        ]);
        (new Event($testData))->validate();
    }

    public function testValidateIsArchivedNotPast(): void
    {
        // - Validation fails: event is not past
        $this->expectException(ValidationException::class);
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

        $this->expectException(ValidationException::class);
        $testData = array_merge($data, ['reference' => 'forb1dden-ch@rs']);
        (new Event($testData))->validate();
    }

    public function testToPdf()
    {
        Carbon::setTestNow(Carbon::create(2022, 9, 23, 12, 0, 0));

        $result = Event::findOrFail(1)->toPdf(new I18n('fr_CH'));
        $this->assertInstanceOf(Pdf::class, $result);
        $this->assertSame('fiche-de-sortie-testing-corp-premier-evenement.pdf', $result->getName());
        $this->assertMatchesHtmlSnapshot($result->getRawContent());

        $result = Event::findOrFail(2)->toPdf(new I18n('en'));
        $this->assertInstanceOf(Pdf::class, $result);
        $this->assertSame('release-sheet-testing-corp-second-evenement.pdf', $result->getName());
        $this->assertMatchesHtmlSnapshot($result->getRawContent());
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
                [ 'id' => 6, 'quantity' => 1 ],
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
        $this->assertEquals(5, count($event->materials));

        $expectedData = [
            ['id' => 3, 'quantity' => 20],
            ['id' => 2, 'quantity' => 3],
            ['id' => 5, 'quantity' => 14],
            ['id' => 1, 'quantity' => 8],
            ['id' => 6, 'quantity' => 1],
        ];
        foreach ($expectedData as $index => $expected) {
            $this->assertArrayHasKey($index, $event->materials);
            $resultMaterial = $event->materials[$index];

            $this->assertEquals($expected['id'], $resultMaterial['id']);
            $this->assertEquals($expected['quantity'], $resultMaterial['pivot']['quantity']);
        }
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
                'start_time' => ['La date de fin doit être postérieure à la date de début'],
                'end_time' => ['La date de fin doit être postérieure à la date de début'],
            ],
            2 => [
                'start_time' => ["L'assignation de ce technicien se termine après l'événement."],
                'end_time' => ["L'assignation de ce technicien se termine après l'événement."],
            ],
        ];
        $this->assertEquals($expectedErrors, $errors);
    }

    public function testSyncMaterials()
    {
        $materials = [
            ['id' => 2, 'quantity' => 4],
            ['id' => 1, 'quantity' => 7],
            ['id' => 6, 'quantity' => 2],
        ];
        $event = Event::findOrFail(4);
        $event->syncMaterials($materials);
        $this->assertEquals(3, count($event->materials));

        $expectedData = [
            ['id' => 1, 'quantity' => 7],
            ['id' => 2, 'quantity' => 4],
            ['id' => 6, 'quantity' => 2],
        ];
        $materials = $event->materials->sortBy('id')->values();
        foreach ($expectedData as $index => $expected) {
            $this->assertArrayHasKey($index, $materials);
            $resultMaterial = $materials[$index];

            $this->assertEquals($expected['id'], $resultMaterial['id']);
            $this->assertEquals($expected['quantity'], $resultMaterial['pivot']['quantity']);
        }
    }

    public function testDuplicateBadData()
    {
        $this->expectException(ValidationException::class);
        Event::findOrFail(1)->duplicate(['start_date' => 'invalid-date']);
    }

    public function testDuplicate()
    {
        Carbon::setTestNow(Carbon::create(2021, 07, 23, 12, 31, 24));

        // - Test simple.
        $newEvent = Event::findOrFail(1)->duplicate([
            'user_id' => 1,
            'start_date' => '2021-08-01 00:00:00',
            'end_date' => '2021-08-02 23:59:59',
        ]);
        $expected = [
            'id' => 7,
            'user_id' => null,
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
            'technicians' => [
                [
                    'id' => 3,
                    'event_id' => 7,
                    'technician_id' => 1,
                    'start_time' => '2021-08-01 09:00:00',
                    'end_time' => '2021-08-02 22:00:00',
                    'position' => 'Régisseur',
                    'technician' => Technician::find(1)->toArray(),
                ],
                [
                    'id' => 4,
                    'event_id' => 7,
                    'technician_id' => 2,
                    'start_time' => '2021-08-02 14:00:00',
                    'end_time' => '2021-08-02 18:00:00',
                    'position' => 'Technicien plateau',
                    'technician' => Technician::find(2)->toArray(),
                ],
            ],
            'created_at' => '2021-07-23 12:31:24',
            'updated_at' => '2021-07-23 12:31:24',
            'deleted_at' => null,
        ];
        $this->assertEquals($expected, (
            $newEvent
                ->append(['technicians'])
                ->attributesToArray()
        ));
        $this->assertCount(1, $newEvent->beneficiaries);
        $this->assertCount(3, $newEvent->materials);

        // - Test avec un événement dupliqué plus long que l'original.
        $newEvent = Event::findOrFail(1)->duplicate(
            [
                'start_date' => '2021-08-01 00:00:00',
                'end_date' => '2021-08-03 23:59:59', // - Un jour de plus que l'original.
            ],
            User::findOrFail(1),
        );
        $expected = [
            'id' => 8,
            'user_id' => 1,
            'reference' => null,
            'title' => 'Premier événement',
            'description' => null,
            'start_date' => '2021-08-01 00:00:00',
            'end_date' => '2021-08-03 23:59:59',
            'is_confirmed' => false,
            'is_archived' => false,
            'location' => 'Gap',
            'is_billable' => true,
            'is_return_inventory_done' => false,
            'technicians' => [
                [
                    'id' => 5,
                    'event_id' => 8,
                    'technician_id' => 1,
                    'start_time' => '2021-08-01 09:00:00',
                    'end_time' => '2021-08-02 22:00:00',
                    'position' => 'Régisseur',
                    'technician' => Technician::find(1)->toArray(),
                ],
                [
                    'id' => 6,
                    'event_id' => 8,
                    'technician_id' => 2,
                    'start_time' => '2021-08-02 14:00:00',
                    'end_time' => '2021-08-02 18:00:00',
                    'position' => 'Technicien plateau',
                    'technician' => Technician::find(2)->toArray(),
                ],
            ],
            'created_at' => '2021-07-23 12:31:24',
            'updated_at' => '2021-07-23 12:31:24',
            'deleted_at' => null,
        ];
        $this->assertEquals($expected, (
            $newEvent
                ->append(['technicians'])
                ->attributesToArray()
        ));

        // - Test avec un événement dupliqué plus court que l'original.
        $newEvent = Event::findOrFail(1)->duplicate([
            'start_date' => '2021-08-01 00:00:00',
            'end_date' => '2021-08-01 23:59:59', // - Un jour de moins que l'original
        ]);
        $expected = [
            'id' => 9,
            'user_id' => null,
            'reference' => null,
            'title' => 'Premier événement',
            'description' => null,
            'start_date' => '2021-08-01 00:00:00',
            'end_date' => '2021-08-01 23:59:59',
            'is_confirmed' => false,
            'is_archived' => false,
            'location' => 'Gap',
            'is_billable' => true,
            'is_return_inventory_done' => false,
            'technicians' => [
                [
                    'id' => 7,
                    'event_id' => 9,
                    'technician_id' => 1,
                    'start_time' => '2021-08-01 09:00:00',
                    'end_time' => '2021-08-01 23:45:00',
                    'position' => 'Régisseur',
                    'technician' => Technician::find(1)->toArray(),
                ],
            ],
            'created_at' => '2021-07-23 12:31:24',
            'updated_at' => '2021-07-23 12:31:24',
            'deleted_at' => null,
        ];
        $this->assertEquals($expected, (
            $newEvent
                ->append(['technicians'])
                ->attributesToArray()
        ));
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
        // - Test à une date qui contient un événement, mais dont l'inventaire
        //   est terminé (#1).
        $this->assertEmpty(Event::notReturned(new Carbon('2018-12-18'))->get()->toArray());

        // - Test à une date qui contient un événement dont l'inventaire n'est pas terminé,
        //   mais qui est archivé (#3).
        $this->assertEmpty(Event::notReturned(new Carbon('2018-12-16'))->get()->toArray());

        // - Test à une date qui correspond à la date de fin d'un événement non archivé,
        //   dont l'inventaire n'est pas terminé (#4).
        $results = Event::notReturned(new Carbon('2019-04-10'))->get()->toArray();
        $this->assertCount(1, $results);
        $this->assertEquals(4, $results[0]['id']);
        $this->assertEquals('Concert X', $results[0]['title']);
        $this->assertEquals('2019-04-10 23:59:59', $results[0]['end_date']);

        // - Test pour une période qui contient un événement non-archivé,
        //   dont l'inventaire n'est pas terminé (#4).
        $period = new Period(
            new Carbon('2018-01-01'),
            new Carbon('2020-01-15')
        );
        $results = Event::notReturned($period)->get()->toArray();
        $this->assertCount(2, $results);
        $this->assertEquals(4, $results[0]['id']);
        $this->assertEquals('Concert X', $results[0]['title']);
        $this->assertEquals(5, $results[1]['id']);
        $this->assertEquals('Kermesse de l\'école des trois cailloux', $results[1]['title']);
    }
}
