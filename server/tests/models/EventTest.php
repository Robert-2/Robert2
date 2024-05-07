<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Illuminate\Support\Carbon;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\Attribute;
use Loxya\Models\Event;
use Loxya\Models\User;
use Loxya\Services\I18n;
use Loxya\Support\Arr;
use Loxya\Support\Pdf;
use Loxya\Support\Period;

final class EventTest extends TestCase
{
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
                'mobilization_start_date' => '2018-12-15 08:30:00',
                'mobilization_end_date' => '2018-12-16 15:45:00',
                'operation_start_date' => '2018-12-15 09:00:00',
                'operation_end_date' => '2018-12-17 00:00:00',
                'operation_is_full_days' => false,
                'color' => null,
                'is_confirmed' => false,
                'is_archived' => true,
                'location' => "Brousse",
                'is_billable' => false,
                'is_departure_inventory_done' => true,
                'departure_inventory_datetime' => '2018-12-15 08:17:00',
                'departure_inventory_author_id' => 1,
                'is_return_inventory_done' => true,
                'return_inventory_datetime' => '2018-12-16 15:42:00',
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
                'mobilization_start_date' => '2018-12-16 15:45:00',
                'mobilization_end_date' => '2018-12-19 00:00:00',
                'operation_start_date' => '2018-12-17 10:00:00',
                'operation_end_date' => '2018-12-18 18:00:00',
                'operation_is_full_days' => false,
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
                'mobilization_start_date' => '2018-12-18 00:00:00',
                'mobilization_end_date' => '2018-12-20 00:00:00',
                'operation_start_date' => '2018-12-18 00:00:00',
                'operation_end_date' => '2018-12-20 00:00:00',
                'operation_is_full_days' => true,
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
        $results = Event::query()
            ->inPeriod(
                'first day of December 2018', // -> `2018-12-01`
                'third sun of December 2018', // -> `2018-12-16`
            )
            ->get();
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

        // - Retourne les événements qui ont un bénéficiaire dont le nom contient "tain".
        $this->assertSame(
            [
                ['id' => 1, 'title' => 'Premier événement'],
                ['id' => 5, 'title' => "Kermesse de l'école des trois cailloux"],
            ],
            Event::search('tain')
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
        Carbon::setTestNow(Carbon::create(2024, 2, 26, 13, 40, 0));

        // - L'événement #1 contient des pénuries.
        $event = tap(Event::findOrFail(1), static function (Event $event) {
            $event->is_return_inventory_done = false;
            $event->return_inventory_datetime = null;
            $event->return_inventory_author_id = null;
            $event->mobilization_end_date = '2024-02-26 13:30:00';
            $event->save();
            $event->refresh();
        });
        $this->assertTrue($event->has_missing_materials);

        // - L'événement #3 est archivé, pas de calcul des pénuries.
        $event = tap(Event::findOrFail(3), static function (Event $event) {
            // - On met à jour les dates (en annulant l'archivage + inventaire de retour)
            $event->is_archived = false;
            $event->is_departure_inventory_done = false;
            $event->departure_inventory_datetime = null;
            $event->departure_inventory_author_id = null;
            $event->is_return_inventory_done = false;
            $event->return_inventory_datetime = null;
            $event->return_inventory_author_id = null;
            $event->mobilization_period = new Period('2024-02-25 13:30:00', '2024-02-26 13:30:00', false);
            $event->operation_period = new Period('2024-02-26', '2024-02-26', true);
            $event->save();

            // - Puis on ré-active l'inventaire de retour + on ré-archive ...
            $event->is_archived = true;
            $event->is_departure_inventory_done = true;
            $event->departure_inventory_datetime = '2024-02-25 13:30:00';
            $event->is_return_inventory_done = true;
            $event->return_inventory_datetime = '2024-02-26 13:30:00';
            $event->save();
            $event->refresh();
        });
        $this->assertNull($event->has_missing_materials);

        // - L'événement #3 lorsqu'il est désarchivé, ne contient pas de pénurie.
        $event = tap(Event::findOrFail(3), static function (Event $event) {
            $event->is_archived = false;
            $event->is_return_inventory_done = false;
            $event->return_inventory_datetime = null;
            $event->return_inventory_author_id = null;
            $event->save();
            $event->refresh();
        });
        $this->assertFalse($event->has_missing_materials);
    }

    public function testHasNotReturnedMaterials(): void
    {
        // - Event #1 does not have material not returned
        $this->assertFalse(Event::findOrFail(1)->has_not_returned_materials);

        // - Event #2 have some materials not returned.
        $this->assertTrue(Event::findOrFail(2)->has_not_returned_materials);

        // - L'événement #3 est archivé, pas de calcul du matériel non retourné.
        $this->assertNull(Event::findOrFail(3)->has_not_returned_materials);
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
            'mobilization_period' => new Period('2020-02-27 14:30:00', '2020-03-06 10:00:00'),
            'operation_period' => new Period('2020-03-01', '2020-03-04', false),
            'is_confirmed' => false,
            'author_id' => 1,
        ];

        // - Pas de soucis au niveau des dates.
        $this->assertTrue((new Event($data))->isValid());

        // - Erreur: La date de fin est avant la date de début.
        $testData = array_merge($data, [
            'mobilization_period' => new Period('2020-03-01 00:00:00', '2020-03-05 00:00:00', false),
            'operation_start_date' => '2020-03-01 00:00:00',
            'operation_end_date' => '2020-02-21 00:00:00',
            'operation_is_full_days' => false,
        ]);
        $expectedErrors = [
            'operation_end_date' => ['La date de fin doit être postérieure à la date de début.'],
        ];
        $this->assertSameCanonicalize($expectedErrors, (new Event($testData))->validationErrors());

        // - Erreur: Les dates de mobilisation ne sont pas arrondies au quart d'heure près.
        $testData = array_merge($data, [
            'mobilization_period' => new Period('2020-02-27 14:12:00', '2020-03-06 10:02:30'),
        ]);
        $expectedErrors = [
            'mobilization_end_date' => ["La date doit être arrondie au quart d'heure le plus proche."],
            'mobilization_start_date' => ["La date doit être arrondie au quart d'heure le plus proche."],
        ];
        $this->assertSameCanonicalize($expectedErrors, (new Event($testData))->validationErrors());
    }

    public function testValidateIsArchived(): void
    {
        $baseData = [
            'title' => "Test is_archived validation",
            'operation_period' => new Period('2020-03-01', '2020-03-03', true),
            'mobilization_period' => new Period('2020-03-01', '2020-03-03', true),
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
            'operation_period' => new Period('2120-03-01', '2120-03-03', true),
            'mobilization_period' => new Period('2120-03-01 00:00:00', '2120-03-04 00:00:00'),
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
            'mobilization_period' => new Period('2020-03-01', '2020-03-03', true),
            'operation_period' => new Period('2020-03-01', '2020-03-03', true),
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
        $generateEvent = static function (array $data = []): Event {
            $data = Arr::defaults($data, [
                'title' => "Les vieilles charrues",
                'mobilization_period' => new Period('2020-02-22', '2020-04-03', true),
                'operation_period' => new Period('2020-03-01', '2020-03-03', true),
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
                    'position' => ' Testeur ',
                    'period' => new Period('2019-03-01 10:00:00', '2019-03-02 19:00:00'),
                ],
                [
                    'id' => 2,
                    'position' => 'Stagiaire observateur',
                    'period' => new Period('2019-03-02 09:00:00', '2019-03-02 16:00:00'),
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
                            'position' => 'Testeur',
                            'period' => [
                                'start' => '2019-03-01 10:00:00',
                                'end' => '2019-03-02 19:00:00',
                                'isFullDays' => false,
                            ],
                            'technician' => TechniciansTest::data(1),
                        ],
                        [
                            'id' => 5,
                            'event_id' => 4,
                            'technician_id' => 2,
                            'position' => 'Stagiaire observateur',
                            'period' => [
                                'start' => '2019-03-02 09:00:00',
                                'end' => '2019-03-02 16:00:00',
                                'isFullDays' => false,
                            ],
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
                ],
            ),
            $event->serialize(Event::SERIALIZE_DETAILS),
        );
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
    }

    public function testSyncTechnicians(): void
    {
        Carbon::setTestNow(Carbon::create(2019, 2, 20, 13, 30, 0));

        $technicians = [
            [
                'id' => 1,
                'position' => 'Roadie déballage',
                'period' => new Period('2019-03-01 08:00:00', '2019-03-01 20:00:00'),
            ],
            [
                'id' => 1,
                'position' => 'Roadie remballage',
                'period' => new Period('2019-04-10 08:00:00', '2019-04-10 20:00:00'),
            ],
            [
                'id' => 2,
                'position' => 'Régisseur',
                'period' => new Period('2019-03-02 10:00:00', '2019-04-09 17:00:00'),
            ],
        ];
        $event = Event::findOrFail(4);
        $event->syncTechnicians($technicians);
        $this->assertCount(3, $event->technicians);
        $this->assertEquals('Roger Rabbit', $event->technicians[0]['technician']['full_name']);
        $this->assertEquals('2019-03-01 08:00:00', $event->technicians[0]['start_date']);
        $this->assertEquals('2019-03-01 20:00:00', $event->technicians[0]['end_date']);
        $this->assertEquals('Roadie déballage', $event->technicians[0]['position']);
        $this->assertEquals('Jean Technicien', $event->technicians[1]['technician']['full_name']);
        $this->assertEquals('2019-03-02 10:00:00', $event->technicians[1]['start_date']);
        $this->assertEquals('2019-04-09 17:00:00', $event->technicians[1]['end_date']);
        $this->assertEquals('Régisseur', $event->technicians[1]['position']);
        $this->assertEquals('Roger Rabbit', $event->technicians[2]['technician']['full_name']);
        $this->assertEquals('2019-04-10 08:00:00', $event->technicians[2]['start_date']);
        $this->assertEquals('2019-04-10 20:00:00', $event->technicians[2]['end_date']);
        $this->assertEquals('Roadie remballage', $event->technicians[2]['position']);
    }

    public function testSyncTechniciansValidationErrors(): void
    {
        Carbon::setTestNow(Carbon::create(2019, 2, 20, 13, 30, 0));

        $technicians = [
            [
                'id' => 1,
                'position' => 'Roadie déballage',
                'period' => new Period('2019-03-01 20:00:00', '2019-03-02 08:00:00'),
            ],
            [
                'id' => 2,
                'position' => 'Régisseur',
                'period' => new Period('2019-04-10 10:00:00', '2019-04-11 17:00:00'),
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
            2 => [
                'start_date' => ["La période d'assignation du technicien est en dehors de la période de l'événement."],
                'end_date' => ["La période d'assignation du technicien est en dehors de la période de l'événement."],
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
        Event::findOrFail(1)->duplicate([
            // - Période invalide: La start date ne contient pas une heure pile.
            'operation_period' => new Period('2021-08-01 10:38:20', '2021-08-02'),
        ]);
    }

    public function testDuplicate(): void
    {
        Carbon::setTestNow(Carbon::create(2021, 07, 23, 12, 31, 24));

        // - Test simple.
        $newEvent = Event::findOrFail(1)->duplicate([
            'mobilization_period' => new Period('2021-08-01', '2021-08-02', true),
            'operation_period' => new Period('2021-08-01', '2021-08-02', true),
            'author_id' => 1,
        ]);
        $expected = [
            'id' => 8,
            'reference' => null,
            'title' => 'Premier événement',
            'description' => null,
            'mobilization_start_date' => '2021-08-01 00:00:00',
            'mobilization_end_date' => '2021-08-03 00:00:00',
            'operation_start_date' => '2021-08-01 00:00:00',
            'operation_end_date' => '2021-08-03 00:00:00',
            'operation_is_full_days' => true,
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
            'technicians' => [],
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
                // - Un jour de plus que l'original.
                'mobilization_period' => new Period('2021-08-03', '2021-08-05', true),
                'operation_period' => new Period('2021-08-03', '2021-08-05', true),
            ],
            User::findOrFail(1),
        );
        $expected = [
            'id' => 9,
            'reference' => null,
            'title' => 'Premier événement',
            'description' => null,
            'mobilization_start_date' => '2021-08-03 00:00:00',
            'mobilization_end_date' => '2021-08-06 00:00:00',
            'operation_start_date' => '2021-08-03 00:00:00',
            'operation_end_date' => '2021-08-06 00:00:00',
            'operation_is_full_days' => true,
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
            'technicians' => [],
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
            // - Un jour de moins que l'original.
            'mobilization_period' => new Period('2021-08-06', '2021-08-06', true),
            'operation_period' => new Period('2021-08-06', '2021-08-06', true),
        ]);
        $expected = [
            'id' => 10,
            'reference' => null,
            'title' => 'Premier événement',
            'description' => null,
            'mobilization_start_date' => '2021-08-06 00:00:00',
            'mobilization_end_date' => '2021-08-07 00:00:00',
            'operation_start_date' => '2021-08-06 00:00:00',
            'operation_end_date' => '2021-08-07 00:00:00',
            'operation_is_full_days' => true,
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
            'technicians' => [],
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
                    ->map(static fn ($material) => [
                        'id' => $material->id,
                        'quantity' => $material->pivot->quantity,
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
            'mobilization_period' => new Period('2023-01-01', '2023-01-10', true),
            'operation_period' => new Period('2023-01-01', '2023-01-10', true),
        ]);
        $this->assertInstanceOf(Event::class, $newEvent1);
        $assertQuantities($newEvent1, $expectedQuantities);
    }

    public function testChangeDatesLonger(): void
    {
        Carbon::setTestNow(Carbon::create(2018, 11, 10, 15, 0, 0));

        // - On invalide l'inventaire de retour pour pouvoir modifier.
        $event = Event::findOrFail(1);
        $event->is_departure_inventory_done = false;
        $event->departure_inventory_datetime = null;
        $event->departure_inventory_author_id = null;
        $event->is_return_inventory_done = false;
        $event->return_inventory_datetime = null;
        $event->return_inventory_author_id = null;
        $event->save();

        $event = Event::staticEdit(1, [
            // - Un jour de plus.
            'mobilization_period' => new Period('2018-12-17', '2018-12-19', true),
            'operation_period' => new Period('2018-12-17', '2018-12-19', true),
        ]);
        $this->assertCount(2, $event->technicians);
        $this->assertEquals('Roger Rabbit', $event->technicians[0]['technician']['full_name']);
        $this->assertEquals('2018-12-17 09:00:00', $event->technicians[0]['start_date']);
        $this->assertEquals('2018-12-18 22:00:00', $event->technicians[0]['end_date']);
        $this->assertEquals('Jean Technicien', $event->technicians[1]['technician']['full_name']);
        $this->assertEquals('2018-12-18 14:00:00', $event->technicians[1]['start_date']);
        $this->assertEquals('2018-12-18 18:00:00', $event->technicians[1]['end_date']);
    }

    public function testChangeDatesHalfTime(): void
    {
        Carbon::setTestNow(Carbon::create(2018, 12, 10, 15, 0, 0));

        // - On invalide l'inventaire de retour pour pouvoir modifier.
        $event = Event::findOrFail(1);
        $event->is_departure_inventory_done = false;
        $event->departure_inventory_datetime = null;
        $event->departure_inventory_author_id = null;
        $event->is_return_inventory_done = false;
        $event->return_inventory_datetime = null;
        $event->return_inventory_author_id = null;
        $event->save();

        $event = Event::staticEdit(1, [
            // - Un jour de moins.
            'mobilization_period' => new Period('2018-12-17', '2018-12-17', true),
            'operation_period' => new Period('2018-12-17', '2018-12-17', true),
        ]);
        $this->assertCount(1, $event->technicians);
        $this->assertEquals('Roger Rabbit', $event->technicians[0]['technician']['full_name']);
        $this->assertEquals('2018-12-17 09:00:00', $event->technicians[0]['start_date']);
        $this->assertEquals('2018-12-18 00:00:00', $event->technicians[0]['end_date']);
    }

    public function testGetAllNotReturned(): void
    {
        // - Test à une date qui contient un événement, mais dont l'inventaire est terminé (#1).
        $period = new Period('2018-12-18', '2018-12-18', true);
        $this->assertEmpty(Event::notReturned($period)->get()->toArray());

        // - Test à une date qui contient un événement dont l'inventaire
        //   n'est pas terminé, mais qui est archivé (#3).
        $period = new Period('2018-12-16', '2018-12-16', true);
        $this->assertEmpty(Event::notReturned($period)->get()->toArray());

        // - Test à une date qui correspond à la date de fin d'un événement
        //   non archivé, dont l'inventaire n'est pas terminé (#4).
        $period = new Period('2019-04-10', '2019-04-10', true);
        $results = Event::notReturned($period)->get()->pluck('id')->all();
        $this->assertEquals([4], $results);

        // - Test pour une période qui contient deux événements non-archivés,
        //   dont l'inventaire n'est pas terminé (#4 et #5).
        $period = new Period('2018-01-01', '2020-01-15', true);
        $results = Event::notReturned($period)->get()->pluck('id')->all();
        $this->assertEquals([4, 5], $results);
    }

    public function testTotalisableAttributes(): void
    {
        $getTestValues = static fn (Attribute $attribute) => (
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
