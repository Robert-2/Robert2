<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Illuminate\Support\Carbon;
use Loxya\Errors\Exception\ConflictException;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\Attribute;
use Loxya\Models\Event;
use Loxya\Models\Technician;
use Loxya\Models\User;
use Loxya\Services\I18n;
use Loxya\Support\Arr;
use Loxya\Support\Pdf;
use Loxya\Support\Period;

final class EventTest extends TestCase
{
    public function testGetAll(): void
    {
        Carbon::setTestNow(Carbon::create(2020, 06, 15, 12, 0, 0));

        // - La méthode `getAll` ne doit retourner que les événements dans l'année courante.
        $expected = [
            [
                'id' => 5,
                'title' => "Kermesse de l'école des trois cailloux",
                'description' => null,
                'reference' => null,
                'start_date' => '2020-01-01 00:00:00',
                'end_date' => '2020-01-01 23:59:59',
                'color' => null,
                'is_confirmed' => false,
                'is_archived' => false,
                'location' => "Saint-Jean-la-Forêt",
                'is_billable' => false,
                'is_departure_inventory_done' => false,
                'departure_inventory_author_id' => null,
                'departure_inventory_datetime' => null,
                'is_return_inventory_done' => false,
                'return_inventory_author_id' => null,
                'return_inventory_datetime' => null,
                'created_at' => '2019-12-25 14:59:40',
                'note' => null,
                'author_id' => 1,
                'preparer_id' => null,
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
                'title' => "Avant-premier événement",
                'description' => null,
                'reference' => null,
                'start_date' => "2018-12-15 00:00:00",
                'end_date' => "2018-12-16 23:59:59",
                'color' => null,
                'is_confirmed' => false,
                'is_archived' => true,
                'location' => "Brousse",
                'is_billable' => false,
                'is_departure_inventory_done' => true,
                'departure_inventory_datetime' => '2018-12-15 01:00:00',
                'departure_inventory_author_id' => 1,
                'is_return_inventory_done' => true,
                'return_inventory_datetime' => '2018-12-16 23:59:59',
                'return_inventory_author_id' => 1,
                'note' => null,
                'author_id' => 1,
                'preparer_id' => null,
                'created_at' => '2018-12-14 12:20:00',
                'updated_at' => '2018-12-14 12:30:00',
                'deleted_at' => null,
            ],
            [
                'id' => 1,
                'title' => "Premier événement",
                'description' => null,
                'reference' => null,
                'start_date' => "2018-12-17 00:00:00",
                'end_date' => "2018-12-18 23:59:59",
                'color' => null,
                'is_confirmed' => false,
                'is_archived' => false,
                'location' => "Gap",
                'is_billable' => true,
                'is_departure_inventory_done' => true,
                'departure_inventory_datetime' => '2018-12-16 15:35:00',
                'departure_inventory_author_id' => 1,
                'is_return_inventory_done' => true,
                'return_inventory_datetime' => null,
                'return_inventory_author_id' => null,
                'note' => null,
                'author_id' => 1,
                'preparer_id' => null,
                'created_at' => '2018-12-01 12:50:45',
                'updated_at' => '2018-12-05 08:31:21',
                'deleted_at' => null,
            ],
            [
                'id' => 2,
                'title' => "Second événement",
                'description' => null,
                'reference' => null,
                'start_date' => "2018-12-18 00:00:00",
                'end_date' => "2018-12-19 23:59:59",
                'color' => '#ffba49',
                'is_confirmed' => false,
                'is_archived' => false,
                'location' => "Lyon",
                'is_billable' => true,
                'is_departure_inventory_done' => false,
                'departure_inventory_datetime' => null,
                'departure_inventory_author_id' => null,
                'is_return_inventory_done' => true,
                'return_inventory_datetime' => '2018-12-20 14:30:00',
                'return_inventory_author_id' => 2,
                'note' => "Il faudra envoyer le matériel sur Lyon avant l'avant-veille.",
                'author_id' => 1,
                'preparer_id' => null,
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

    public function testSearchScope(): void
    {
        // - Retourne les événements qui ont le terme "premier" dans le titre.
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
        $this->assertCount(1, $result);
        $this->assertEquals('Transporter', $result->get(0)['reference']);
        $this->assertEquals(1, $result->get(0)['pivot']['quantity_missing']);

        // - Get missing materials of event #5
        $result = Event::find(5)->missingMaterials();
        $this->assertCount(0, $result);
    }

    public function testHasMissingMaterials(): void
    {
        // - L'événement #4 contient des pénuries.
        $result = Event::find(1)
            ->fill(['end_date' => (new \Datetime('tomorrow'))->format('Y-m-d H:i:s')])
            ->setAppends(['has_missing_materials']);
        $this->assertSame(true, $result->hasMissingMaterials);

        // - L'événement #3 est archivé, pas de calcul des pénuries.
        $result = Event::find(3)
            ->fill([
                'start_date' => (new \Datetime)->format('Y-m-d H:i:s'),
                'end_date' => (new \Datetime('tomorrow'))->format('Y-m-d H:i:s'),
            ])
            ->setAppends(['has_missing_materials']);
        $this->assertSame(null, $result->hasMissingMaterials);

        // - L'événement #3 lorsqu'il est désarchivé, ne contient pas de pénurie.
        $event = tap(Event::find(3), function (Event $event) {
            $event->is_archived = false;
            $event->fill([
                'start_date' => (new \Datetime)->format('Y-m-d H:i:s'),
                'end_date' => (new \Datetime('tomorrow'))->format('Y-m-d H:i:s'),
            ]);
        });
        $result = $event->setAppends(['has_missing_materials']);
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

    public function testTotalWithoutDiscount(): void
    {
        $this->assertEquals('597.54', (string) Event::find(1)->total_without_discount);
    }

    public function testTotalDiscountable(): void
    {
        $this->assertEquals('72.54', (string) Event::find(1)->total_discountable);
    }

    public function testTotalReplacement(): void
    {
        $this->assertEquals('19808.90', (string) Event::find(1)->total_replacement);
    }

    public function testGetParksAttribute(): void
    {
        // - Events qui ont du matériel dans un seul parc
        foreach ([1, 2, 3, 5] as $eventId) {
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
            'title' => "Test dates validation",
            'start_date' => '2020-03-01 00:00:00',
            'is_confirmed' => false,
            'author_id' => 1,
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
        $baseData = [
            'title' => "Test is_archived validation",
            'start_date' => '2020-03-01 00:00:00',
            'end_date' => '2020-03-03 23:59:59',
            'is_confirmed' => false,
            'author_id' => 1,
        ];

        // - Validation pass: event has a return inventory
        $event1 = new Event($baseData);
        $event1->is_return_inventory_done = true;
        $event1->is_archived = true;
        $event1->validate();

        // - Validation pass: event is not archived
        $event2 = new Event($baseData);
        $event2->is_return_inventory_done = true;
        $event2->is_archived = false;
        $event2->validate();

        // - Validation fails: event hos no return inventory
        $this->expectException(ValidationException::class);
        $event3 = new Event($baseData);
        $event3->is_return_inventory_done = false;
        $event3->is_archived = true;
        $event3->validate();
    }

    public function testValidateIsArchivedNotPast(): void
    {
        // - Validation fails: event is not past
        $this->expectException(ValidationException::class);

        $event = new Event([
            'title' => "Test is_archive validation failure",
            'start_date' => '2120-03-01 00:00:00',
            'end_date' => '2120-03-03 23:59:59',
            'is_confirmed' => true,
            'author_id' => 1,
        ]);
        $event->is_archived = true;
        $event->validate();
    }

    public function testValidateReference(): void
    {
        $data = [
            'title' => "Test dates validation",
            'start_date' => '2020-03-01 00:00:00',
            'end_date' => '2020-03-03 23:59:59',
            'is_confirmed' => false,
            'author_id' => 1,
        ];

        foreach (['REF1', null] as $testValue) {
            $testData = array_merge($data, ['reference' => $testValue]);
            (new Event($testData))->validate();
        }

        $this->expectException(ValidationException::class);
        $testData = array_merge($data, ['reference' => 'forb1dden-ch@rs']);
        (new Event($testData))->validate();
    }

    public function testValidation(): void
    {
        $generateEvent = function (array $data = []): Event {
            $data = Arr::defaults($data, [
                'title' => "Les vieilles charrues",
                'start_date' => '2020-03-01 00:00:00',
                'end_date' => '2020-03-03 23:59:59',
                'is_confirmed' => false,
                'author_id' => 1,
            ]);
            return new Event($data);
        };

        // - Avec des données valides.
        $this->assertTrue($generateEvent()->isValid());
        $this->assertTrue(Event::findOrFail(1)->isValid());

        // - Avec des erreurs de base...
        $event = $generateEvent([
            'color' => 'not-a-color',
        ]);
        $expectedErrors = [
            'color' => ["Code de couleur invalide (doit être un code hexadécimal)."],
        ];
        $this->assertFalse($event->isValid());
        $this->assertSame($expectedErrors, $event->validationErrors());
    }

    public function testToPdf(): void
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

    public function testStaticEdit(): void
    {
        Carbon::setTestNow(Carbon::create(2019, 2, 20, 13, 30, 0));

        $data = [
            'title' => ' Test update ',
            'description' => '',
            'beneficiaries' => [3],
            'technicians' => [
                [
                    'id' => 1,
                    'start_time' => '2019-03-01 10:00:00',
                    'end_time' => '2019-03-02 19:00:00',
                    'position' => ' Testeur ',
                ],
                [
                    'id' => 2,
                    'start_time' => '2019-03-02 09:00:00',
                    'end_time' => '2019-03-02 16:00:00',
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

        $event = Event::staticEdit(4, $data);
        $this->assertEquals(
            array_replace(
                EventsTest::data(4, Event::SERIALIZE_DETAILS),
                [
                    'title' => "Test update",
                    'total_replacement' => "158581.70",
                    'is_return_inventory_started' => false,
                    'has_missing_materials' => true,
                    'beneficiaries' => [
                        BeneficiariesTest::data(3),
                    ],
                    'technicians' => [
                        [
                            'id' => 4,
                            'event_id' => 4,
                            'technician_id' => 1,
                            'start_time' => '2019-03-01 10:00:00',
                            'end_time' => '2019-03-02 19:00:00',
                            'position' => 'Testeur',
                            'technician' => TechniciansTest::data(1),
                        ],
                        [
                            'id' => 5,
                            'event_id' => 4,
                            'technician_id' => 2,
                            'start_time' => '2019-03-02 09:00:00',
                            'end_time' => '2019-03-02 16:00:00',
                            'position' => 'Stagiaire observateur',
                            'technician' => TechniciansTest::data(2),
                        ],
                    ],
                    'materials' => [
                        array_merge(MaterialsTest::data(1), [
                            'pivot' => [
                                'quantity' => 8,
                                'quantity_departed' => null,
                                'quantity_returned' => 0,
                                'quantity_returned_broken' => 0,
                                'departure_comment' => null,
                            ],
                        ]),
                        array_merge(MaterialsTest::data(6), [
                            'pivot' => [
                                'quantity' => 1,
                                'quantity_departed' => 1,
                                'quantity_returned' => 1,
                                'quantity_returned_broken' => 0,
                                'departure_comment' => null,
                            ],
                        ]),
                        array_merge(MaterialsTest::data(3), [
                            'pivot' => [
                                'quantity' => 20,
                                'quantity_departed' => null,
                                'quantity_returned' => null,
                                'quantity_returned_broken' => null,
                                'departure_comment' => null,
                            ],
                        ]),
                        array_merge(MaterialsTest::data(2), [
                            'pivot' => [
                                'quantity' => 3,
                                'quantity_departed' => null,
                                'quantity_returned' => null,
                                'quantity_returned_broken' => null,
                                'departure_comment' => null,
                            ],
                        ]),
                        array_merge(MaterialsTest::data(5), [
                            'pivot' => [
                                'quantity' => 14,
                                'quantity_departed' => null,
                                'quantity_returned' => null,
                                'quantity_returned_broken' => null,
                                'departure_comment' => null,
                            ],
                        ]),
                    ],
                    'updated_at' => '2019-02-20 13:30:00',
                ]
            ),
            $event->serialize(Event::SERIALIZE_DETAILS),
        );

        // - Si l'inventaire de retour de l'événement est fait, on attend une `LogicException`.
        $this->expectException(\LogicException::class);
        Event::staticEdit(1, $data);
    }

    public function testStaticEditBadBeneficiaries(): void
    {
        Carbon::setTestNow(Carbon::create(2019, 2, 20, 13, 30, 0));

        $data = ['beneficiaries' => 'not_an_array'];
        $this->expectException(\InvalidArgumentException::class);
        Event::staticEdit(4, $data);
    }

    public function testStaticEditBadTechnicians(): void
    {
        Carbon::setTestNow(Carbon::create(2019, 2, 20, 13, 30, 0));

        $data = ['technicians' => 'not_an_array'];
        $this->expectException(\InvalidArgumentException::class);
        Event::staticEdit(4, $data);
    }

    public function testStaticEditBadMaterials(): void
    {
        Carbon::setTestNow(Carbon::create(2019, 2, 20, 13, 30, 0));

        $data = ['materials' => 'not_an_array'];
        $this->expectException(\InvalidArgumentException::class);
        Event::staticEdit(4, $data);
    }

    public function testSyncBeneficiaries(): void
    {
        Carbon::setTestNow(Carbon::create(2019, 2, 20, 13, 30, 0));

        $beneficiaries = [2, 3];
        $event = Event::findOrFail(4);
        $event->syncBeneficiaries($beneficiaries);
        $this->assertEquals(2, count($event->beneficiaries));
        $this->assertEquals('Client Benef', $event->beneficiaries[0]['full_name']);
        $this->assertEquals('Roger Rabbit', $event->beneficiaries[1]['full_name']);

        // - Si l'inventaire de retour de l'événement est fait, on attend une `LogicException`.
        $this->expectException(\LogicException::class);
        $event = Event::findOrFail(1);
        $event->syncBeneficiaries($beneficiaries);
    }

    public function testSyncTechnicians(): void
    {
        Carbon::setTestNow(Carbon::create(2019, 2, 20, 13, 30, 0));

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
        $this->assertCount(3, $event->technicians);
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

        // - Si l'inventaire de retour de l'événement est fait, on attend une `LogicException`.
        $this->expectException(\LogicException::class);
        $event = Event::findOrFail(1);
        $event->syncTechnicians($technicians);
    }

    public function testSyncTechniciansValidationErrors(): void
    {
        Carbon::setTestNow(Carbon::create(2019, 2, 20, 13, 30, 0));

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
                'start_time' => ['La date de fin doit être postérieure à la date de début.'],
                'end_time' => ['La date de fin doit être postérieure à la date de début.'],
            ],
            2 => [
                'start_time' => ["L'assignation de ce technicien se termine après l'événement."],
                'end_time' => ["L'assignation de ce technicien se termine après l'événement."],
            ],
        ];
        $this->assertEquals($expectedErrors, $errors);
    }

    public function testSyncMaterials(): void
    {
        Carbon::setTestNow(Carbon::create(2019, 2, 20, 13, 30, 0));

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

    public function testDuplicateBadData(): void
    {
        $this->expectException(ValidationException::class);
        Event::findOrFail(1)->duplicate(['start_date' => 'invalid-date']);
    }

    public function testDuplicate(): void
    {
        Carbon::setTestNow(Carbon::create(2021, 07, 23, 12, 31, 24));

        // - Test simple.
        $newEvent = Event::findOrFail(1)->duplicate([
            'start_date' => '2021-08-01 00:00:00',
            'end_date' => '2021-08-02 23:59:59',
            'author_id' => 1,
        ]);
        $expected = [
            'id' => 8,
            'reference' => null,
            'title' => 'Premier événement',
            'description' => null,
            'start_date' => '2021-08-01 00:00:00',
            'end_date' => '2021-08-02 23:59:59',
            'color' => null,
            'is_confirmed' => false,
            'is_archived' => false,
            'location' => 'Gap',
            'is_billable' => true,
            'is_departure_inventory_done' => false,
            'departure_inventory_author_id' => null,
            'departure_inventory_datetime' => null,
            'is_return_inventory_done' => false,
            'return_inventory_author_id' => null,
            'return_inventory_datetime' => null,
            'technicians' => [
                [
                    'id' => 4,
                    'event_id' => 8,
                    'technician_id' => 1,
                    'start_time' => '2021-08-01 09:00:00',
                    'end_time' => '2021-08-02 22:00:00',
                    'position' => 'Régisseur',
                    'technician' => Technician::find(1)->toArray(),
                ],
                [
                    'id' => 5,
                    'event_id' => 8,
                    'technician_id' => 2,
                    'start_time' => '2021-08-02 14:00:00',
                    'end_time' => '2021-08-02 18:00:00',
                    'position' => 'Technicien plateau',
                    'technician' => Technician::find(2)->toArray(),
                ],
            ],
            'note' => null,
            'author_id' => null,
            'preparer_id' => null,
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
                'start_date' => '2021-08-03 00:00:00',
                'end_date' => '2021-08-05 23:59:59', // - Un jour de plus que l'original.
            ],
            false,
            User::findOrFail(1),
        );
        $expected = [
            'id' => 9,
            'reference' => null,
            'title' => 'Premier événement',
            'description' => null,
            'start_date' => '2021-08-03 00:00:00',
            'end_date' => '2021-08-05 23:59:59',
            'color' => null,
            'is_confirmed' => false,
            'is_archived' => false,
            'location' => 'Gap',
            'is_billable' => true,
            'is_departure_inventory_done' => false,
            'departure_inventory_author_id' => null,
            'departure_inventory_datetime' => null,
            'is_return_inventory_done' => false,
            'return_inventory_author_id' => null,
            'return_inventory_datetime' => null,
            'technicians' => [
                [
                    'id' => 6,
                    'event_id' => 9,
                    'technician_id' => 1,
                    'start_time' => '2021-08-03 09:00:00',
                    'end_time' => '2021-08-04 22:00:00',
                    'position' => 'Régisseur',
                    'technician' => Technician::find(1)->toArray(),
                ],
                [
                    'id' => 7,
                    'event_id' => 9,
                    'technician_id' => 2,
                    'start_time' => '2021-08-04 14:00:00',
                    'end_time' => '2021-08-04 18:00:00',
                    'position' => 'Technicien plateau',
                    'technician' => Technician::find(2)->toArray(),
                ],
            ],
            'note' => null,
            'author_id' => 1,
            'preparer_id' => null,
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
            'start_date' => '2021-08-06 00:00:00',
            'end_date' => '2021-08-06 23:59:59', // - Un jour de moins que l'original
        ]);
        $expected = [
            'id' => 10,
            'reference' => null,
            'title' => 'Premier événement',
            'description' => null,
            'start_date' => '2021-08-06 00:00:00',
            'end_date' => '2021-08-06 23:59:59',
            'color' => null,
            'is_confirmed' => false,
            'is_archived' => false,
            'location' => 'Gap',
            'is_billable' => true,
            'is_departure_inventory_done' => false,
            'departure_inventory_author_id' => null,
            'departure_inventory_datetime' => null,
            'is_return_inventory_done' => false,
            'return_inventory_author_id' => null,
            'return_inventory_datetime' => null,
            'technicians' => [
                [
                    'id' => 8,
                    'event_id' => 10,
                    'technician_id' => 1,
                    'start_time' => '2021-08-06 09:00:00',
                    'end_time' => '2021-08-07 00:00:00',
                    'position' => 'Régisseur',
                    'technician' => Technician::find(1)->toArray(),
                ],
            ],
            'note' => null,
            'author_id' => null,
            'preparer_id' => null,
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

    public function testDuplicateWithConflicts(): void
    {
        $assertQuantities = function (Event $event, $expectedQuantities) {
            $this->assertSameCanonicalize($expectedQuantities, (
                $event->materials
                    ->map(fn ($material) => [
                        'id' => $material->id,
                        'quantity' => $material->pivot->quantity,
                    ])
                    ->all()
            ));
        };
        $assertTechnicians = function (Event $event, $expectedTechnicians) {
            $this->assertSameCanonicalize($expectedTechnicians, (
                $event->technicians
                    ->map(fn ($technician) => [
                        'id' => $technician->technician_id,
                        'start_time' =>  $technician->start_time,
                        'end_time' =>  $technician->end_time,
                        'position' =>  $technician->position,
                    ])
                    ->all()
            ));
        };

        $expectedQuantities = [
            [
                'id' => 1,
                'quantity' => 2,
            ],
            [
                'id' => 6,
                'quantity' => 2,
            ],
            [
                'id' => 7,
                'quantity' => 1,
            ],
            [
                'id' => 4,
                'quantity' => 2,
            ],
        ];

        // - On duplique à un endroit "sans problème".
        $newEvent1 = Event::findOrFail(7)->duplicate([
            'start_date' => '2023-01-01 00:00:00',
            'end_date' => '2023-01-10 23:59:59',
        ]);
        $this->assertInstanceOf(Event::class, $newEvent1);
        $assertQuantities($newEvent1, $expectedQuantities);

        // - On duplique l'événement #7 pendant l'événement #4, cela va
        //   créer un conflit d'unité #1, déjà utilisée au même moment.
        $newEvent2 = Event::findOrFail(7)->duplicate([
            'start_date' => '2019-03-03 00:00:00',
            'end_date' => '2019-03-05 23:59:59',
        ]);
        $this->assertInstanceOf(Event::class, $newEvent2);
        $assertQuantities($newEvent2, $expectedQuantities);

        // - On duplique l'événement #1 pendant la même période que l'événement #7, cela va
        //   créer un conflit de technicien mobilisé au même moment (#2, du 25 au 28).
        $expectedException = new ConflictException(
            'Technician #2 already busy at this time.',
            ConflictException::TECHNICIAN_ALREADY_BUSY,
        );
        $this->assertException($expectedException, fn () => (
            Event::findOrFail(1)->duplicate([
                'start_date' => '2023-05-25 00:00:00',
                'end_date' => '2023-05-26 23:59:59',
            ])
        ));

        // - Idem que ci-dessus mais on force la duplication.
        //   (ce qui est censé avoir pour effet de supprimer les
        //   techniciens en conflit du nouvel événement)
        $newEvent3 = Event::findOrFail(1)->duplicate(
            [
                'start_date' => '2023-05-26 00:00:00',
                'end_date' => '2023-05-26 23:59:59',
            ],
            true,
        );
        $this->assertInstanceOf(Event::class, $newEvent3);
        $assertTechnicians($newEvent3, [
            [
                'id' => 1,
                'end_time' => '2023-05-27 00:00:00',
                'start_time' => '2023-05-26 09:00:00',
                'position' => 'Régisseur',
            ],
        ]);

        // - On force la duplication de l'événement #7 pendant la même période, cela va créer :
        //   - Un conflit d'unité utilisé au même moment (#5 et #8).
        //   - Un conflit de technicien mobilisé au même moment (#2, du 25 au 28).
        $newEvent4 = Event::findOrFail(7)->duplicate(
            [
                'start_date' => '2023-05-26 00:00:00',
                'end_date' => '2023-05-26 23:59:59',
            ],
            true,
        );
        $this->assertInstanceOf(Event::class, $newEvent4);
        $assertQuantities($newEvent4, $expectedQuantities);
        $assertTechnicians($newEvent4, []);
    }

    public function testChangeDatesLonger(): void
    {
        Carbon::setTestNow(Carbon::create(2018, 11, 10, 15, 0, 0));

        // On invalide l'inventaire de retour pour pouvoir modifier
        $event = Event::findOrFail(1);
        $event->is_return_inventory_done = false;
        $event->save();

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

    public function testChangeDatesHalfTime(): void
    {
        Carbon::setTestNow(Carbon::create(2018, 12, 10, 15, 0, 0));

        // On invalide l'inventaire de retour pour pouvoir modifier
        $event = Event::findOrFail(1);
        $event->is_return_inventory_done = false;
        $event->save();

        $event = Event::staticEdit(1, [
            'end_date' => '2018-12-17 23:59:59', // - Un jour de moins
        ]);
        $this->assertCount(1, $event->technicians);
        $this->assertEquals('Roger Rabbit', $event->technicians[0]['technician']['full_name']);
        $this->assertEquals('2018-12-17 09:00:00', $event->technicians[0]['start_time']);
        $this->assertEquals('2018-12-18 00:00:00', $event->technicians[0]['end_time']);
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
        $results = Event::notReturned(new Carbon('2019-04-10'))->get()->pluck('id')->all();
        $this->assertEquals([4], $results);

        // - Test pour une période qui contient deux événements non-archivés,
        //   dont l'inventaire n'est pas terminé (#4 et #5).
        $period = new Period(
            new Carbon('2018-01-01'),
            new Carbon('2020-01-15')
        );
        $results = Event::notReturned($period)->get()->pluck('id')->all();
        $this->assertEquals([4, 5], $results);
    }

    public function testTotalisableAttributes(): void
    {
        $getTestValues = fn (Attribute $attribute) => (
            array_intersect_key(
                $attribute->append('value')->toArray(),
                array_flip(['id', 'name', 'value', 'unit']),
            )
        );

        // Totaux des attributs numériques pour l'événement #1
        $result = Event::findOrFail(1)->totalisable_attributes;
        $expected = [
            1 => [
                'id' => 1,
                'name' => 'Poids',
                'value' => 41.85,
                'unit' => 'kg',
            ],
            3 => [
                'id' => 3,
                'name' => 'Puissance',
                'value' => 945,
                'unit' => 'W',
            ],
        ];
        $this->assertEquals($expected, array_map($getTestValues, $result));

        // Totaux des attributs numériques pour l'événement #2
        $result = Event::findOrFail(2)->totalisable_attributes;
        $expected = [
            1 => [
                'id' => 1,
                'name' => 'Poids',
                'value' => 113.9,
                'unit' => 'kg',
            ],
            3 => [
                'id' => 3,
                'name' => 'Puissance',
                'value' => 2620,
                'unit' => 'W',
            ],
        ];
        $this->assertEquals($expected, array_map($getTestValues, $result));
    }
}
