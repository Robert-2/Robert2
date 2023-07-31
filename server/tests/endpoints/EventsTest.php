<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Loxya\Models\Event;
use Loxya\Support\Arr;
use Loxya\Support\Filesystem\UploadedFile;

final class EventsTest extends ApiTestCase
{
    public static function data(?int $id, string $format = Event::SERIALIZE_DEFAULT)
    {
        $events = new Collection([
            [
                'id' => 1,
                'reference' => null,
                'title' => "Premier événement",
                'description' => null,
                'location' => "Gap",
                'start_date' => "2018-12-17 00:00:00",
                'end_date' => "2018-12-18 23:59:59",
                'color' => null,
                'duration' => 2,
                'degressive_rate' => '1.75',
                'discount_rate' => '0',
                'vat_rate' => '20.00',
                'currency' => 'EUR',
                'daily_total_without_discount' => '341.45',
                'daily_total_discountable' => '41.45',
                'daily_total_discount' => '0.00',
                'daily_total_without_taxes' => '341.45',
                'daily_total_taxes' => '68.29',
                'daily_total_with_taxes' => '409.74',
                'total_without_taxes' => '597.54',
                'total_taxes' => '119.51',
                'total_with_taxes' => '717.05',
                'total_replacement' => '19808.90',
                'is_confirmed' => false,
                'is_archived' => false,
                'is_billable' => true,
                'is_return_inventory_started' => true,
                'is_return_inventory_done' => true,
                'has_missing_materials' => null,
                'has_not_returned_materials' => false,
                'categories' => [1, 2],
                'parks' => [1],
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
                            'quantity' => 1,
                            'quantity_returned' => 1,
                            'quantity_returned_broken' => 0,
                        ],
                    ]),
                    array_merge(MaterialsTest::data(2), [
                        'pivot' => [
                            'quantity' => 1,
                            'quantity_returned' => 1,
                            'quantity_returned_broken' => 0,
                        ],
                    ]),
                    array_merge(MaterialsTest::data(4), [
                        'pivot' => [
                            'quantity' => 1,
                            'quantity_returned' => 1,
                            'quantity_returned_broken' => 1,
                        ],
                    ]),
                ],
                'invoices' => [
                    InvoicesTest::data(1),
                ],
                'estimates' => [
                    EstimatesTest::data(1),
                ],
                'note' => null,
                'author' => UsersTest::data(1),
                'created_at' => '2018-12-01 12:50:45',
                'updated_at' => '2018-12-05 08:31:21',
            ],
            [
                'id' => 2,
                'reference' => null,
                'title' => 'Second événement',
                'description' => null,
                'location' => 'Lyon',
                'start_date' => '2018-12-18 00:00:00',
                'end_date' => '2018-12-19 23:59:59',
                'color' => '#ffba49',
                'duration' => 2,
                'degressive_rate' => '1.75',
                'discount_rate' => '0',
                'vat_rate' => '20.00',
                'currency' => 'EUR',
                'daily_total_without_discount' => '951.00',
                'daily_total_discountable' => '51.00',
                'daily_total_discount' => '0.00',
                'daily_total_without_taxes' => '951.00',
                'daily_total_taxes' => '190.20',
                'daily_total_with_taxes' => '1141.20',
                'total_without_taxes' => '1664.25',
                'total_taxes' => '332.85',
                'total_with_taxes' => '1997.10',
                'total_replacement' => '58899.80',
                'is_archived' => false,
                'is_billable' => true,
                'is_confirmed' => false,
                'has_missing_materials' => null,
                'has_not_returned_materials' => true,
                'is_return_inventory_started' => true,
                'is_return_inventory_done' => true,
                'categories' => [1],
                'parks' => [1],
                'materials' => [
                    array_merge(MaterialsTest::data(1), [
                        'pivot' => [
                            'quantity' => 3,
                            'quantity_returned' => 2,
                            'quantity_returned_broken' => 0,
                        ],
                    ]),
                    array_merge(MaterialsTest::data(2), [
                        'pivot' => [
                            'quantity' => 2,
                            'quantity_returned' => 2,
                            'quantity_returned_broken' => 0,
                        ],
                    ]),
                ],
                'beneficiaries' => [
                    BeneficiariesTest::data(3),
                ],
                'technicians' => [],
                'estimates' => [],
                'invoices' => [],
                'note' => "Il faudra envoyer le matériel sur Lyon avant l'avant-veille.",
                'author' => UsersTest::data(1),
                'created_at' => '2018-12-16 12:50:45',
                'updated_at' => null,
            ],
            [
                'id' => 3,
                'reference' => null,
                'title' => 'Avant-premier événement',
                'description' => null,
                'location' => 'Brousse',
                'start_date' => '2018-12-15 00:00:00',
                'end_date' => '2018-12-16 23:59:59',
                'color' => null,
                'duration' => 2,
                'currency' => 'EUR',
                'total_replacement' => '1353.90',
                'has_missing_materials' => null,
                'has_not_returned_materials' => null,
                'is_archived' => true,
                'is_billable' => false,
                'is_confirmed' => false,
                'is_return_inventory_started' => true,
                'is_return_inventory_done' => true,
                'categories' => [1, 2],
                'parks' => [1],
                'materials' => [
                    array_merge(MaterialsTest::data(3), [
                        'pivot' => [
                            'quantity' => 10,
                            'quantity_returned' => 0,
                            'quantity_returned_broken' => 0,
                        ],
                    ]),
                    array_merge(MaterialsTest::data(2), [
                        'pivot' => [
                            'quantity' => 1,
                            'quantity_returned' => 0,
                            'quantity_returned_broken' => 0,
                        ],
                    ]),
                    array_merge(MaterialsTest::data(5), [
                        'pivot' => [
                            'quantity' => 12,
                            'quantity_returned' => 0,
                            'quantity_returned_broken' => 0,
                        ],
                    ]),
                ],
                'beneficiaries' => [],
                'technicians' => [],
                'author' => UsersTest::data(1),
                'note' => null,
                'created_at' => '2018-12-14 12:20:00',
                'updated_at' => '2018-12-14 12:30:00',
            ],
            [
                'id' => 4,
                'reference' => null,
                'title' => 'Concert X',
                'description' => null,
                'location' => 'Moon',
                'start_date' => '2019-03-01 00:00:00',
                'end_date' => '2019-04-10 23:59:59',
                'color' => '#ef5b5b',
                'duration' => 41,
                'currency' => 'EUR',
                'total_replacement' => '116238.00',
                'is_archived' => false,
                'is_billable' => false,
                'is_confirmed' => false,
                'is_return_inventory_started' => true,
                'is_return_inventory_done' => false,
                'has_missing_materials' => null,
                'has_not_returned_materials' => null,
                'categories' => [1, 3],
                'parks' => [1, 2],
                'materials' => [
                    array_merge(MaterialsTest::data(1), [
                        'pivot' => [
                            'quantity' => 1,
                            'quantity_returned' => 0,
                            'quantity_returned_broken' => 0,
                        ],
                    ]),
                    array_merge(MaterialsTest::data(6), [
                        'pivot' => [
                            'quantity' => 2,
                            'quantity_returned' => 1,
                            'quantity_returned_broken' => 0,
                        ],
                    ]),
                    array_merge(MaterialsTest::data(7), [
                        'pivot' => [
                            'quantity' => 3,
                            'quantity_returned' => 0,
                            'quantity_returned_broken' => 0,
                        ],
                    ]),
                ],
                'beneficiaries' => [],
                'technicians' => [],
                'note' => "Penser à contacter Cap Canaveral fin janvier pour booker le pas de tir.",
                'author' => UsersTest::data(1),
                'created_at' => '2019-01-01 20:12:00',
                'updated_at' => null,
            ],
            [
                'id' => 5,
                'reference' => null,
                'title' => "Kermesse de l'école des trois cailloux",
                'description' => null,
                'location' => 'Saint-Jean-la-Forêt',
                'start_date' => '2020-01-01 00:00:00',
                'end_date' => '2020-01-01 23:59:59',
                'color' => null,
                'duration' => 1,
                'currency' => 'EUR',
                'total_replacement' => '17000.00',
                'is_archived' => false,
                'is_billable' => false,
                'is_confirmed' => false,
                'is_return_inventory_started' => false,
                'is_return_inventory_done' => false,
                'has_missing_materials' => null,
                'has_not_returned_materials' => null,
                'categories' => [4],
                'parks' => [1],
                'materials' => [
                    array_merge(MaterialsTest::data(8), [
                        'pivot' => [
                            'quantity' => 2,
                            'quantity_returned' => null,
                            'quantity_returned_broken' => null,
                        ],
                    ]),
                ],
                'beneficiaries' => [
                    BeneficiariesTest::data(1),
                ],
                'technicians' => [],
                'note' => null,
                'author' => UsersTest::data(1),
                'created_at' => '2019-12-25 14:59:40',
                'updated_at' => null,
            ],
            [
                'id' => 6,
                'reference' => null,
                'title' => 'Un événement sans inspiration',
                'description' => null,
                'location' => 'La Clusaz',
                'start_date' => '2019-03-15 00:00:00',
                'end_date' => '2019-04-01 23:59:59',
                'color' => '#ef5b5b',
                'duration' => 18,
                'currency' => 'EUR',
                'total_replacement' => '0.00',
                'is_archived' => false,
                'is_billable' => false,
                'is_confirmed' => false,
                'is_return_inventory_started' => false,
                'is_return_inventory_done' => false,
                'has_missing_materials' => null,
                'has_not_returned_materials' => null,
                'categories' => [],
                'parks' => [],
                'materials' => [],
                'beneficiaries' => [],
                'technicians' => [],
                'note' => null,
                'author' => UsersTest::data(1),
                'created_at' => '2019-02-01 12:00:00',
                'updated_at' => '2019-02-01 12:05:00',
            ],
            [
                'id' => 7,
                'reference' => null,
                'title' => 'Médiévales de Machin-le-chateau 2023',
                'description' => null,
                'location' => 'Machin-le-chateau',
                'start_date' => '2023-05-25 00:00:00',
                'end_date' => '2023-05-28 23:59:59',
                'color' => null,
                'duration' => 4,
                'degressive_rate' => '3.25',
                'discount_rate' => '0',
                'vat_rate' => '20.00',
                'currency' => 'EUR',
                'daily_total_without_discount' => '1031.88',
                'daily_total_discountable' => '31.90',
                'daily_total_discount' => '0.00',
                'daily_total_without_taxes' => '1031.88',
                'daily_total_taxes' => '206.38',
                'daily_total_with_taxes' => '1238.26',
                'total_without_taxes' => '3353.61',
                'total_taxes' => '670.72',
                'total_with_taxes' => '4024.33',
                'total_replacement' => '71756.00',
                'is_archived' => false,
                'is_billable' => true,
                'is_confirmed' => true,
                'is_return_inventory_started' => true,
                'is_return_inventory_done' => false,
                'has_missing_materials' => null,
                'has_not_returned_materials' => null,
                'categories' => [1, 2, 3],
                'parks' => [1, 2],
                'materials' => [
                    array_merge(MaterialsTest::data(1), [
                        'pivot' => [
                            'quantity' => 2,
                            'quantity_returned' => 1,
                            'quantity_returned_broken' => 0,
                        ],
                    ]),
                    array_merge(MaterialsTest::data(6), [
                        'pivot' => [
                            'quantity' => 2,
                            'quantity_returned' => 2,
                            'quantity_returned_broken' => 1,
                        ],
                    ]),
                    array_merge(MaterialsTest::data(7), [
                        'pivot' => [
                            'quantity' => 1,
                            'quantity_returned' => null,
                            'quantity_returned_broken' => null,
                        ],
                    ]),
                    array_merge(MaterialsTest::data(4), [
                        'pivot' => [
                            'quantity' => 2,
                            'quantity_returned' => 1,
                            'quantity_returned_broken' => 1,
                        ],
                    ]),
                ],
                'beneficiaries' => [],
                'technicians' => [
                    [
                        'id' => 3,
                        'event_id' => 7,
                        'technician_id' => 2,
                        'start_time' => '2023-05-25 00:00:00',
                        'end_time' => '2023-05-28 23:59:59',
                        'position' => 'Ingénieur du son',
                        'technician' => TechniciansTest::data(2),
                    ],
                ],
                'invoices' => [],
                'estimates' => [],
                'note' => null,
                'author' => UsersTest::data(1),
                'created_at' => '2022-05-29 18:00:00',
                'updated_at' => '2022-05-29 18:05:00',
            ],
        ]);

        $events = match ($format) {
            Event::SERIALIZE_DEFAULT => $events->map(fn($event) => (
                Arr::only($event, [
                    'id',
                    'title',
                    'reference',
                    'description',
                    'start_date',
                    'end_date',
                    'color',
                    'location',
                    'is_confirmed',
                    'is_billable',
                    'is_archived',
                    'is_return_inventory_done',
                    'note',
                    'created_at',
                    'updated_at',
                ])
            )),
            Event::SERIALIZE_DETAILS => $events->map(fn($event) => (
                Arr::except($event, ['parks', 'categories'])
            )),
            Event::SERIALIZE_SUMMARY => $events->map(fn($event) => (
                Arr::only($event, [
                    'id',
                    'title',
                    'start_date',
                    'end_date',
                    'location',
                ])
            )),
            Event::SERIALIZE_BOOKING_DEFAULT => $events->map(fn($event) => (
                Arr::except($event, ['parks', 'categories'])
            )),
            Event::SERIALIZE_BOOKING_SUMMARY => $events->map(fn($event) => (
                Arr::only($event, [
                    'id',
                    'title',
                    'reference',
                    'description',
                    'start_date',
                    'end_date',
                    'duration',
                    'color',
                    'location',
                    'beneficiaries',
                    'technicians',
                    'is_confirmed',
                    'is_billable',
                    'is_archived',
                    'is_return_inventory_done',
                    'has_missing_materials',
                    'has_not_returned_materials',
                    'parks',
                    'categories',
                    'created_at',
                    'updated_at',
                ])
            )),
            default => throw new \InvalidArgumentException(sprintf("Unknown format \"%s\"", $format)),
        };

        return static::_dataFactory($id, $events->all());
    }

    public function testGetEventNotFound()
    {
        $this->client->get('/api/events/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testGetOneEvent()
    {
        $ids = array_column(static::data(null), 'id');
        foreach ($ids as $id) {
            $this->client->get(sprintf('/api/events/%d', $id));
            $this->assertStatusCode(StatusCode::STATUS_OK);
            $this->assertResponseData(self::data($id, Event::SERIALIZE_DETAILS));
        }
    }

    public function testCreateEvent()
    {
        Carbon::setTestNow(Carbon::create(2023, 05, 20, 17, 20, 11));

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
        $expected = [
            'id' => 8,
            'reference' => null,
            'title' => "Un nouvel événement",
            'description' => null,
            'location' => "Avignon",
            'start_date' => '2019-09-01 00:00:00',
            'end_date' => '2019-09-03 23:59:59',
            'color' => null,
            'duration' => 3,
            'degressive_rate' => '2.50',
            'discount_rate' => '0',
            'vat_rate' => '20.00',
            'currency' => 'EUR',
            'daily_total_without_discount' => '0.00',
            'daily_total_discountable' => '0.00',
            'daily_total_discount' => '0.00',
            'daily_total_without_taxes' => '0.00',
            'daily_total_taxes' => '0.00',
            'daily_total_with_taxes' => '0.00',
            'total_without_taxes' => '0.00',
            'total_taxes' => '0.00',
            'total_with_taxes' => '0.00',
            'total_replacement' => '0.00',
            'is_confirmed' => true,
            'is_archived' => false,
            'is_billable' => true,
            'is_return_inventory_started' => false,
            'is_return_inventory_done' => false,
            'has_missing_materials' => null,
            'has_not_returned_materials' => null,
            'technicians' => [],
            'beneficiaries' => [],
            'materials' => [],
            'invoices' => [],
            'estimates' => [],
            'note' => null,
            'author' => UsersTest::data(1),
            'created_at' => '2023-05-20 17:20:11',
            'updated_at' => '2023-05-20 17:20:11',
        ];
        $this->client->post('/api/events', $data);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData($expected);

        // - Test avec des données qui contiennent les sous-entités.
        $this->client->post('/api/events', array_merge($data, [
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
        ]));
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData(array_replace($expected, [
            'id' => 9,
            'title' => "Encore un événement",
            'daily_total_without_taxes' => '357.40',
            'daily_total_discountable' => '57.40',
            'daily_total_discount' => '0.00',
            'daily_total_without_discount' => '357.40',
            'daily_total_taxes' => '71.48',
            'daily_total_with_taxes' => '428.88',
            'total_without_taxes' => '893.50',
            'total_taxes' => '178.70',
            'total_with_taxes' => '1072.20',
            'total_replacement' => '19867.90',
            'beneficiaries' => [
                BeneficiariesTest::data(3),
            ],
            'technicians' => [
                [
                    'id' => 5,
                    'event_id' => 9,
                    'technician_id' => 2,
                    'start_time' => '2019-09-01 08:00:00',
                    'end_time' => '2019-09-03 22:00:00',
                    'position' => null,
                    'technician' => TechniciansTest::data(2),
                ],
                [
                    'id' => 4,
                    'event_id' => 9,
                    'technician_id' => 1,
                    'start_time' => '2019-09-01 10:00:00',
                    'end_time' => '2019-09-03 20:00:00',
                    'position' => 'Régie générale',
                    'technician' => TechniciansTest::data(1),
                ],
            ],
            'materials' => [
                array_merge(MaterialsTest::data(1), [
                    'pivot' => [
                        'quantity' => 1,
                        'quantity_returned' => null,
                        'quantity_returned_broken' => null,
                    ],
                ]),
                array_merge(MaterialsTest::data(2), [
                    'pivot' => [
                        'quantity' => 1,
                        'quantity_returned' => null,
                        'quantity_returned_broken' => null,
                    ],
                ]),
                array_merge(MaterialsTest::data(4), [
                    'pivot' => [
                        'quantity' => 2,
                        'quantity_returned' => null,
                        'quantity_returned_broken' => null,
                    ],
                ]),
            ],
        ]));
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

        // - Test avec des données simples
        $data = [
            'id' => 1,
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
        $this->assertResponseData(array_replace(
            self::data(1, Event::SERIALIZE_DETAILS),
            $data,
            ['updated_at' => '2022-10-22 18:42:36'],
        ));

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
        $this->assertResponseData(array_replace(
            self::data(1, Event::SERIALIZE_DETAILS),
            $data,
            [
                'daily_total_without_discount' => '749.85',
                'daily_total_discountable' => '149.85',
                'daily_total_without_taxes' => '749.85',
                'daily_total_taxes' => '149.97',
                'daily_total_with_taxes' => '899.82',
                'total_replacement' => '40376.60',
                'total_without_taxes' => '1312.24',
                'total_taxes' => '262.45',
                'total_with_taxes' => '1574.69',
                'has_not_returned_materials' => true,
                'materials' => [
                    array_merge(MaterialsTest::data(1), [
                        'pivot' => [
                            'quantity' => 2,
                            'quantity_returned' => 1,
                            'quantity_returned_broken' => 0,
                        ],
                    ]),
                    array_merge(MaterialsTest::data(2), [
                        'pivot' => [
                            'quantity' => 4,
                            'quantity_returned' => 1,
                            'quantity_returned_broken' => 0,
                        ],
                    ]),
                    array_merge(MaterialsTest::data(4), [
                        'pivot' => [
                            'quantity' => 3,
                            'quantity_returned' => 1,
                            'quantity_returned_broken' => 1,
                        ],
                    ]),
                ],
                'beneficiaries' => [
                    BeneficiariesTest::data(2),
                ],
                'technicians' => [
                    [
                        'id' => 4,
                        'event_id' => 1,
                        'technician_id' => 1,
                        'start_time' => '2018-12-17 10:30:00',
                        'end_time' => '2018-12-18 23:30:00',
                        'position' => 'Régisseur général',
                        'technician' => TechniciansTest::data(1),
                    ],
                    [
                        'id' => 5,
                        'event_id' => 1,
                        'technician_id' => 2,
                        'start_time' => '2018-12-18 13:30:00',
                        'end_time' => '2018-12-18 23:30:00',
                        'position' => 'Technicien polyvalent',
                        'technician' => TechniciansTest::data(2),
                    ],
                ],
                'updated_at' => '2022-10-22 18:42:36',
            ]
        ));
    }

    public function testDuplicateEventNotFound()
    {
        $this->client->post('/api/events/999/duplicate', []);
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testDuplicateEventBadData()
    {
        $this->client->post('/api/events/1/duplicate', [
            'start_date' => 'invalid-date',
        ]);
        $this->assertApiValidationError([
            'start_date' => ['This date is not valid'],
            'end_date' => ['This date is not valid'],
        ]);
    }

    public function testDuplicateEvent()
    {
        Carbon::setTestNow(Carbon::create(2021, 06, 22, 12, 11, 02));

        // - Duplication de l'événement n°1
        $this->client->post('/api/events/1/duplicate', [
            'start_date' => '2021-07-01 00:00:00',
            'end_date' => '2021-07-03 23:59:59',
        ]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData(array_replace(
            self::data(1, Event::SERIALIZE_DETAILS),
            [
                'id' => 8,
                'start_date' => '2021-07-01 00:00:00',
                'end_date' => '2021-07-03 23:59:59',
                'duration' => 3,
                'degressive_rate' => '2.50',
                'total_taxes' => '170.73',
                'total_with_taxes' => '1024.36',
                'total_without_taxes' => '853.63',
                'is_return_inventory_started' => false,
                'is_return_inventory_done' => false,
                'has_missing_materials' => false,
                'has_not_returned_materials' => null,
                'materials' => array_replace_recursive(
                    self::data(1, Event::SERIALIZE_DETAILS)['materials'],
                    [
                        [
                            'pivot' => [
                                'quantity_returned' => null,
                                'quantity_returned_broken' => null,
                            ],
                        ],
                        [
                            'pivot' => [
                                'quantity_returned' => null,
                                'quantity_returned_broken' => null,
                            ],
                        ],
                        [
                            'pivot' => [
                                'quantity_returned' => null,
                                'quantity_returned_broken' => null,
                            ],
                        ],
                    ],
                ),
                'technicians' => array_replace_recursive(
                    self::data(1, Event::SERIALIZE_DETAILS)['technicians'],
                    [
                        [
                            'id' => 4,
                            'event_id' => 8,
                            'start_time' => '2021-07-01 09:00:00',
                            'end_time' => '2021-07-02 22:00:00',
                        ],
                        [
                            'id' => 5,
                            'event_id' => 8,
                            'start_time' => '2021-07-02 14:00:00',
                            'end_time' => '2021-07-02 18:00:00',
                        ],
                    ],
                ),
                'invoices' => [],
                'estimates' => [],
                'created_at' => '2021-06-22 12:11:02',
                'updated_at' => '2021-06-22 12:11:02',
            ]
        ));

        // - Duplication de l'événement n°3
        $this->client->post('/api/events/3/duplicate', [
            'start_date' => '2021-07-04 00:00:00',
            'end_date' => '2021-07-04 23:59:59',
        ]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData(array_replace(
            self::data(3, Event::SERIALIZE_DETAILS),
            [
                'id' => 9,
                'start_date' => '2021-07-04 00:00:00',
                'end_date' => '2021-07-04 23:59:59',
                'duration' => 1,
                'is_archived' => false,
                'has_missing_materials' => false,
                'is_return_inventory_started' => false,
                'is_return_inventory_done' => false,
                'materials' => array_replace_recursive(
                    self::data(3, Event::SERIALIZE_DETAILS)['materials'],
                    [
                        [
                            'pivot' => [
                                'quantity_returned' => null,
                                'quantity_returned_broken' => null,
                            ],
                        ],
                        [
                            'pivot' => [
                                'quantity_returned' => null,
                                'quantity_returned_broken' => null,
                            ],
                        ],
                        [
                            'pivot' => [
                                'quantity_returned' => null,
                                'quantity_returned_broken' => null,
                            ],
                        ],
                    ],
                ),
                'created_at' => '2021-06-22 12:11:02',
                'updated_at' => '2021-06-22 12:11:02',
            ]
        ));

        // - Duplication de l'événement n°4 (avec unités)
        $this->client->post('/api/events/4/duplicate', [
            'start_date' => '2021-07-04 00:00:00',
            'end_date' => '2021-07-04 23:59:59',
        ]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData(array_replace(
            self::data(4, Event::SERIALIZE_DETAILS),
            [
                'id' => 10,
                'start_date' => '2021-07-04 00:00:00',
                'end_date' => '2021-07-04 23:59:59',
                'color' => '#ef5b5b',
                'duration' => 1,
                'has_missing_materials' => true,
                'is_return_inventory_started' => false,
                'materials' => array_replace_recursive(
                    self::data(4, Event::SERIALIZE_DETAILS)['materials'],
                    [
                        [
                            'pivot' => [
                                'quantity_returned' => null,
                                'quantity_returned_broken' => null,
                            ],
                        ],
                        [
                            'pivot' => [
                                'quantity_returned' => null,
                                'quantity_returned_broken' => null,
                            ],
                        ],
                        [
                            'pivot' => [
                                'quantity_returned' => null,
                                'quantity_returned_broken' => null,
                            ],
                        ],
                    ],
                ),
                'note' => "Penser à contacter Cap Canaveral fin janvier pour booker le pas de tir.",
                'created_at' => '2021-06-22 12:11:02',
                'updated_at' => '2021-06-22 12:11:02',
            ]
        ));
    }

    public function testUpdateReturnInventoryNotFound()
    {
        $this->client->put('/api/events/999/return');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testUpdateReturnInventory()
    {
        Carbon::setTestNow(Carbon::create(2023, 2, 1, 10, 00, 00));

        $validInventories = [
            2 => [
                ['id' => 1, 'actual' => 2, 'broken' => 0],
                ['id' => 2, 'actual' => 2, 'broken' => 1],
            ],
            7 => [
                [
                    'id' => 1,
                    'actual' => 2,
                    'broken' => 2,
                ],
                [
                    'id' => 6,
                    'actual' => 1,
                    'broken' => 0,
                ],
                [
                    'id' => 7,
                    'actual' => 1,
                    'broken' => 1,
                ],
                [
                    'id' => 4,
                    'actual' => 0,
                    'broken' => 0,
                ],
            ],
        ];

        // - Avec un événement dont l'inventaire de retour est déjà terminé.
        $this->client->put('/api/events/2/return', $validInventories[2]);
        $this->assertStatusCode(StatusCode::STATUS_CONFLICT);
        $this->assertApiErrorMessage("This event's return inventory is already done.");

        // - On repasse l'inventaire de retour en non terminé.
        $event = Event::findOrFail(2);
        $event->is_return_inventory_done = false;
        $event->save();

        $initialData = array_replace(
            self::data(2, Event::SERIALIZE_DETAILS),
            [
                'has_not_returned_materials' => null,
                'is_return_inventory_done' => false,
                'updated_at' => '2023-02-01 10:00:00',
            ]
        );

        // - Avec un payload vide.
        $this->client->put('/api/events/2/return', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");

        // - Avec un payload invalide.
        foreach ([[['foo' => 'bar']], [1], [true]] as $invalidInventory) {
            $this->client->put('/api/events/2/return', $invalidInventory);
            $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
            $this->assertApiErrorMessage("Invalid data format.");
        }

        // - Avec des données invalides (1)...
        $this->client->put('/api/events/2/return', [
            ['id' => 1, 'actual' => 2, 'broken' => 3],
            ['id' => 2, 'actual' => 3, 'broken' => 0],
        ]);
        $this->assertApiValidationError([
            ['id' => 1, 'message' => "Broken quantity cannot be greater than returned quantity."],
            ['id' => 2, 'message' => "Returned quantity cannot be greater than output quantity."],
        ]);

        // - Avec des données invalides (2)...
        $this->client->put('/api/events/2/return', [
            ['id' => 1, 'actual' => 2, 'broken' => 0],
        ]);
        $this->assertApiValidationError([
            ['id' => 2, 'message' => "Please specify the returned quantity."],
        ]);

        Carbon::setTestNow(Carbon::create(2023, 6, 2, 12, 30, 00));

        // - Avec des données valides simples...
        $this->client->put('/api/events/2/return', $validInventories[2]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace_recursive(
            $initialData,
            [
                'materials' => [
                    [
                        'pivot' => [
                            'quantity' => 3,
                            'quantity_returned' => 2,
                            'quantity_returned_broken' => 0,
                        ],
                    ],
                    [
                        'pivot' => [
                            'quantity' => 2,
                            'quantity_returned' => 2,
                            'quantity_returned_broken' => 1,
                        ],
                    ],
                ],
            ]
        ));
    }

    public function testFinishReturnInventory()
    {
        Carbon::setTestNow(Carbon::create(2023, 2, 1, 10, 00, 00));

        // - Avec un événement dont l'inventaire de retour est déjà terminé.
        $this->client->put('/api/events/2/return/finish');
        $this->assertStatusCode(StatusCode::STATUS_CONFLICT);
        $this->assertApiErrorMessage("This event's return inventory is already done.");

        // - On repasse l'inventaire de retour en non terminé.
        $event = Event::findOrFail(2);
        $event->is_return_inventory_done = false;
        $event->save();

        // - Avec un payload invalide.
        foreach ([[['foo' => 'bar']], [1], [true]] as $invalidInventory) {
            $this->client->put('/api/events/2/return/finish', $invalidInventory);
            $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
            $this->assertApiErrorMessage("Invalid data format.");
        }

        // - Test avec du matériel non-unitaire.
        $this->client->put('/api/events/2/return/finish', [
            ['id' => 1, 'actual' => 3, 'broken' => 0],
            ['id' => 2, 'actual' => 2, 'broken' => 1],
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace_recursive(
            self::data(2, Event::SERIALIZE_DETAILS),
            [
                'is_confirmed' => true,
                'has_not_returned_materials' => false,
                'materials' => [
                    [
                        'pivot' => [
                            'quantity_returned' => 3,
                        ],
                    ],
                    [
                        'out_of_order_quantity' => 1,
                        'updated_at' => '2023-02-01 10:00:00',
                        'pivot' => [
                            'quantity_returned_broken' => 1,
                        ],
                    ],
                ],
                'updated_at' => '2023-02-01 10:00:00',
            ]
        ));
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
            array_replace(MaterialsTest::data(7), [
                'pivot' => [
                    'id' => 11,
                    'event_id' => 4,
                    'material_id' => 7,
                    'quantity' => 3,
                    'quantity_returned' => 0,
                    'quantity_returned_broken' => 0,
                    'quantity_missing' => 1,
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

        // - Événement inexistant
        $this->client->get('/events/999/pdf');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Téléchargement du fichier PDF de l'événement n°1
        $responseStream = $this->client->get('/events/1/pdf');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertTrue($responseStream->isReadable());
        $this->assertMatchesHtmlSnapshot($responseStream->getContents());

        // - Téléchargement du fichier PDF de l'événement n°2
        $responseStream = $this->client->get('/events/2/pdf');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertTrue($responseStream->isReadable());
        $this->assertMatchesHtmlSnapshot($responseStream->getContents());

        // - Téléchargement du fichier PDF de l'événement n°7 (classé par listes)
        $responseStream = $this->client->get('/events/7/pdf');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertTrue($responseStream->isReadable());
        $this->assertMatchesHtmlSnapshot($responseStream->getContents());

        // - Téléchargement du fichier PDF de l'événement n°7 (classé par parcs)
        $responseStream = $this->client->get('/events/7/pdf?sortedBy=parks');
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
                EventsTest::data(1, Event::SERIALIZE_SUMMARY),
                EventsTest::data(3, Event::SERIALIZE_SUMMARY),
            ],
        ]);

        // - Pareil, mais en excluant l'événement n°3
        $this->client->get('/api/events?search=premier&exclude=3');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'count' => 1,
            'data' => [
                EventsTest::data(1, Event::SERIALIZE_SUMMARY),
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

    public function testAttachDocument()
    {
        Carbon::setTestNow(Carbon::create(2022, 10, 22, 18, 42, 36));

        $createUploadedFile = function (string $from) {
            $tmpFile = tmpfile();
            fwrite($tmpFile, file_get_contents($from));
            return $tmpFile;
        };

        // - Événement inexistant.
        $this->client->post('/api/events/999/documents');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Test sans fichier (payload vide)
        $this->client->post('/api/events/3/documents');
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("Invalid number of files sent: a single file is expected.");

        // - Test avec un fichier sans problèmes.
        $this->client->post('/api/events/3/documents', null, (
            new UploadedFile(
                $createUploadedFile(TESTS_FILES_FOLDER . DS . 'file.pdf'),
                13269,
                UPLOAD_ERR_OK,
                "Rapport d'audit 2022.pdf",
                'application/pdf',
            )
        ));
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 7,
            'name' => "Rapport d'audit 2022.pdf",
            'type' => 'application/pdf',
            'size' => 13269,
            'url' => 'http://loxya.test/documents/7',
            'created_at' => '2022-10-22 18:42:36',
        ]);
        $this->assertSame([7], Event::findOrFail(3)->documents->pluck('id')->all());

        // - Test avec des fichiers avec erreurs.
        $invalidUploads = [
            [
                'file' => new UploadedFile(
                    $createUploadedFile(TESTS_FILES_FOLDER . DS . 'file.pdf'),
                    262144000,
                    UPLOAD_ERR_OK,
                    'Un fichier bien trop volumineux.pdf',
                    'application/pdf',
                ),
                'expected' => ['This file exceeds maximum size allowed.'],
            ],
            [
                'file' => new UploadedFile(
                    $createUploadedFile(TESTS_FILES_FOLDER . DS . 'file.csv'),
                    54,
                    UPLOAD_ERR_CANT_WRITE,
                    'échec-upload.csv',
                    'text/csv',
                ),
                'expected' => ['File upload failed.'],
            ],
            [
                'file' => new UploadedFile(
                    tmpfile(),
                    121540,
                    UPLOAD_ERR_OK,
                    'app.dmg',
                    'application/octet-stream',
                ),
                'expected' => ['This file type is not allowed.'],
            ],
        ];
        foreach ($invalidUploads as $invalidUpload) {
            $this->client->post('/api/events/4/documents', null, $invalidUpload['file']);
            $this->assertApiValidationError(['file' => $invalidUpload['expected']]);
        }
    }

    public function testGetDocuments()
    {
        // - Événement inexistant.
        $this->client->get('/api/events/999/documents');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Documents de l'événement #2.
        $this->client->get('/api/events/2/documents');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            DocumentsTest::data(3),
        ]);

        // - Documents de l'événement #1.
        $this->client->get('/api/events/1/documents');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([]);
    }
}
