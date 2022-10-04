<?php
declare(strict_types=1);

namespace Robert2\Tests;

use DateTimeImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Robert2\API\Config\Config;
use Robert2\API\Models\Beneficiary;
use Robert2\API\Models\Event;
use Robert2\API\Models\Material;
use Robert2\API\Models\Person;
use Robert2\Fixtures\RobertFixtures;
use Robert2\Lib\Domain\EventData;

final class EventDataTest extends TestCase
{
    public EventData $EventData;

    protected $_date;
    protected $_event;
    protected $_number;

    public function setUp(): void
    {
        parent::setUp();

        // - Reset fixtures (needed to load event's data)
        try {
            RobertFixtures::resetDataWithDump();
        } catch (\Exception $e) {
            throw new \Exception(sprintf("Unable to reset fixtures: %s", $e->getMessage()));
        }

        $this->_event = Event::findOrFail(1);
        $this->EventData = new EventData($this->_event);
    }

    // ------------------------------------------------------
    // -
    // -    Instanciation tests methods
    // -
    // ------------------------------------------------------

    public function testEmptyEvent()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Cannot create EventData value-object without complete event's data.");
        new EventData(new Event);
    }

    public function testNoBeneficiary()
    {
        $event = new Event([
            'id' => 99,
            'title' => "fake event",
            'start_date' => "2021-04-21 00:00:00",
            'end_date' => "2021-04-21 23:59:59",
        ]);

        $material = new Material(['id' => 4, 'name' => 'Showtec SDS-6', 'reference' => 'SDS-6-01']);
        $materials = new Collection([$material]);
        $event->setRelation('materials', $materials);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Cannot create EventData value-object without complete event's data.");
        new EventData($event);
    }

    public function testNoMaterials()
    {
        $event = new Event([
            'id' => 99,
            'title' => "fake event",
            'start_date' => "2021-04-21 00:00:00",
            'end_date' => "2021-04-21 23:59:59",
        ]);

        $person = new Person(['id' => 100, 'first_name' => 'Client', 'last_name' => 'Benef']);
        $beneficiary = new Beneficiary(['id' => 3]);
        $beneficiary->setRelation('person', $person);
        $event->setRelation('beneficiaries', new Collection([$beneficiary]));

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Cannot create EventData value-object without complete event's data.");
        new EventData($event);
    }

    // ------------------------------------------------------
    // -
    // -    Getters tests methods
    // -
    // ------------------------------------------------------

    public function testToBillingModelData()
    {
        $date = new \DateTimeImmutable();
        $result = $this->EventData->toBillingModelData(1, $date, '2022-0001');
        $expected = [
            'number' => '2022-0001',
            'date' => $date->format('Y-m-d H:i:s'),
            'event_id' => 1,
            'beneficiary_id' => 1,
            'materials' => [
                [
                    'id' => 4,
                    'name' => 'Showtec SDS-6',
                    'reference' => 'SDS-6-01',
                    'park_id' => 1,
                    'category_id' => 2,
                    'sub_category_id' => 4,
                    'rental_price' => 15.95,
                    'replacement_price' => 59.0,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => true,
                    'quantity' => 1
                ],
                [
                    'id' => 2,
                    'name' => 'Processeur DBX PA2',
                    'reference' => 'DBXPA2',
                    'park_id' => 1,
                    'category_id' => 1,
                    'sub_category_id' => 2,
                    'rental_price' => 25.5,
                    'replacement_price' => 349.9,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => true,
                    'quantity' => 1,
                ],
                [
                    'id' => 1,
                    'name' => 'Console Yamaha CL3',
                    'reference' => 'CL3',
                    'park_id' => 1,
                    'category_id' => 1,
                    'sub_category_id' => 1,
                    'rental_price' => 300.0,
                    'replacement_price' => 19400.0,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => false,
                    'quantity' => 1,
                ],
            ],
            'degressive_rate' => '1.75',
            'discount_rate' => '0',
            'vat_rate' => '20',
            'due_amount' => '597.54',
            'replacement_amount' => '19808.9',
            'currency' => Config::getSettings('currency')['iso'],
            'user_id' => 1,
        ];
        $this->assertEquals($expected, $result);
    }

    public function testToBillingModelDataWithDiscount()
    {
        $date = new \DateTime();
        $this->EventData->setDiscountRate(33.33);
        $result = $this->EventData->toBillingModelData(1, $date, '2022-0001');
        $expected = [
            'number' => '2022-0001',
            'date' => $date->format('Y-m-d H:i:s'),
            'event_id' => 1,
            'beneficiary_id' => 1,
            'materials' => [
                [
                    'id' => 4,
                    'name' => 'Showtec SDS-6',
                    'reference' => 'SDS-6-01',
                    'park_id' => 1,
                    'category_id' => 2,
                    'sub_category_id' => 4,
                    'rental_price' => 15.95,
                    'replacement_price' => 59.0,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => true,
                    'quantity' => 1
                ],
                [
                    'id' => 2,
                    'name' => 'Processeur DBX PA2',
                    'reference' => 'DBXPA2',
                    'park_id' => 1,
                    'category_id' => 1,
                    'sub_category_id' => 2,
                    'rental_price' => 25.5,
                    'replacement_price' => 349.9,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => true,
                    'quantity' => 1,
                ],
                [
                    'id' => 1,
                    'name' => 'Console Yamaha CL3',
                    'reference' => 'CL3',
                    'park_id' => 1,
                    'category_id' => 1,
                    'sub_category_id' => 1,
                    'rental_price' => 300.0,
                    'replacement_price' => 19400.0,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => false,
                    'quantity' => 1,
                ],
            ],
            'degressive_rate' => '1.75',
            'discount_rate' => '33.33',
            'vat_rate' => '20',
            'due_amount' => '573.36',
            'replacement_amount' => '19808.9',
            'currency' => Config::getSettings('currency')['iso'],
            'user_id' => 1,
        ];
        $this->assertSame($expected, $result);
    }

    public function testToBillingPdfData()
    {
        $date = new \DateTime();
        $result = $this->EventData->toBillingPdfData($date, '2022-0005');
        $expected = [
            'number' => '2022-0005',
            'date' => DateTimeImmutable::createFromMutable($date),
            'event' => $this->_event->toArray(),
            'beneficiary' => $this->_event->beneficiaries->get(0),
            'dailyAmount' => 341.45,
            'discountableDailyAmount' => 41.45,
            'daysCount' => 2,
            'degressiveRate' => 1.75,
            'discountRate' => 0.0,
            'discountAmount' => 0.0,
            'vatRate' => 0.2,
            'vatAmount' => 68.29,
            'totalDailyExclVat' => 341.45,
            'totalDailyInclVat' => 409.74,
            'totalExclVat' => 597.54,
            'totalInclVat' => 717.05,
            'totalReplacement' => 19808.9,
            'categoriesSubTotals' => [
                ['id' => 2, 'name' => "Lumière", 'quantity' => 1, 'subTotal' => 15.95],
                ['id' => 1, 'name' => "Son", 'quantity' => 2, 'subTotal' => 325.5],
            ],
            'materialList' => [
                4 => [
                    'id' => 4,
                    'name' => 'Gradateurs',
                    'category' => 'Lumière',
                    'categoryHasSubCategories' => true,
                    'materials' => [
                        'SDS-6-01' => [
                            'reference' => 'SDS-6-01',
                            'name' => 'Showtec SDS-6',
                            'stockQuantity' => 2,
                            'attributes' => [
                                [
                                    'id' => 4,
                                    'name' => 'Conforme',
                                    'type' => 'boolean',
                                    'value' => true,
                                    'unit' => null,
                                ],
                                [
                                    'id' => 3,
                                    'name' => 'Puissance',
                                    'type' => 'integer',
                                    'value' => 60,
                                    'unit' => 'W',
                                ],
                                [
                                    'id' => 1,
                                    'name' => 'Poids',
                                    'type' => 'float',
                                    'value' => 3.15,
                                    'unit' => 'kg',
                                ],
                            ],
                            'park' => 'default',
                            'quantity' => 1,
                            'rentalPrice' => 15.95,
                            'replacementPrice' => 59.0,
                            'total' => 15.95,
                            'totalReplacementPrice' => 59.0,
                        ],
                    ],
                ],
                2 => [
                    'id' => 2,
                    'name' => "Processeurs",
                    'category' => 'Son',
                    'categoryHasSubCategories' => true,
                    'materials' => [
                        'DBXPA2' => [
                            'reference' => 'DBXPA2',
                            'name' => 'Processeur DBX PA2',
                            'stockQuantity' => 2,
                            'attributes' => [
                                [
                                    'id' => 3,
                                    'name' => 'Puissance',
                                    'type' => 'integer',
                                    'value' => 35,
                                    'unit' => 'W',
                                ],
                                [
                                    'id' => 1,
                                    'name' => 'Poids',
                                    'type' => 'float',
                                    'value' => 2.2,
                                    'unit' => 'kg',
                                ],
                            ],
                            'park' => 'default',
                            'quantity' => 1,
                            'rentalPrice' => 25.5,
                            'replacementPrice' => 349.9,
                            'total' => 25.5,
                            'totalReplacementPrice' => 349.9,
                        ],
                    ],
                ],
                1 => [
                    'id' => 1,
                    'name' => 'Mixeurs',
                    'category' => 'Son',
                    'categoryHasSubCategories' => true,
                    'materials' => [
                        'CL3' => [
                            'reference' => 'CL3',
                            'name' => 'Console Yamaha CL3',
                            'stockQuantity' => 5,
                            'attributes' => [
                                [
                                    'id' => 3,
                                    'name' =>
                                    'Puissance',
                                    'type' => 'integer',
                                    'value' => 850,
                                    'unit' => 'W',
                                ],
                                [
                                    'id' => 2,
                                    'name' =>
                                    'Couleur',
                                    'type' => 'string',
                                    'value' => 'Grise',
                                    'unit' => null,
                                ],
                                [
                                    'id' => 1,
                                    'name' =>
                                    'Poids',
                                    'type' => 'float',
                                    'value' => 36.5,
                                    'unit' => 'kg',
                                ],
                            ],
                            'park' => 'default',
                            'quantity' => 1,
                            'rentalPrice' => 300.0,
                            'replacementPrice' => 19400.0,
                            'total' => 300.0,
                            'totalReplacementPrice' => 19400.0,
                        ],
                    ],
                ],
            ],
            'company' => Config::getSettings('companyData'),
            'currency' => Config::getSettings('currency')['iso'],
            'currencyName' => Config::getSettings('currency')['name'],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testToEventPdfData()
    {
        $date = new \DateTimeImmutable();
        $result = $this->EventData->toEventPdfData($date);
        $expected = [
            'date' => $date,
            'event' => $this->_event->toArray(),
            'beneficiaries' => $this->_event->beneficiaries,
            'company' => [
                'name' => 'Testing corp.',
                'logo' => null,
                'street' => '5 rue des tests',
                'zipCode' => '05555',
                'locality' => 'Testville',
                'country' => 'France',
                'phone' => '+33123456789',
                'email' => 'jean@testing-corp.dev',
                'legalNumbers' => [
                    [
                        'name' => 'SIRET',
                        'value' => '543 210 080 20145',
                    ],
                    [
                        'name' => 'APE',
                        'value' => '947A',
                    ],
                ],
                'vatNumber' => 'FR11223344556600',
                'vatRate' => 20,
            ],
            'currency' => 'EUR',
            'currencyName' => 'Euro',
            'materialList' => [
                [
                    'id' => 2,
                    'name' => 'Lumière',
                    'materials' => [
                        'SDS-6-01' => [
                            'name' => 'Showtec SDS-6',
                            'reference' => 'SDS-6-01',
                            'quantity' => 1,
                            'stockQuantity' => 2,
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
                            'park' => 'default',
                            'rentalPrice' => 15.95,
                            'replacementPrice' => 59.0,
                            'total' => 15.95,
                            'totalReplacementPrice' => 59.0,
                        ],
                    ],
                ],
                [
                    'id' => 1,
                    'name' => 'Son',
                    'materials' => [
                        'CL3' => [
                            'name' => 'Console Yamaha CL3',
                            'reference' => 'CL3',
                            'quantity' => 1,
                            'stockQuantity' => 5,
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
                            'park' => 'default',
                            'rentalPrice' => 300.0,
                            'replacementPrice' => 19400.0,
                            'total' => 300.0,
                            'totalReplacementPrice' => 19400.0,
                        ],
                        'DBXPA2' => [
                            'name' => 'Processeur DBX PA2',
                            'reference' => 'DBXPA2',
                            'quantity' => 1,
                            'stockQuantity' => 2,
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
                            'park' => 'default',
                            'rentalPrice' => 25.5,
                            'replacementPrice' => 349.9,
                            'total' => 25.5,
                            'totalReplacementPrice' => 349.9,
                        ],
                    ],
                ],
            ],
            'materialDisplayMode' => 'categories',
            'replacementAmount' => 19808.9,
            'technicians' => [
                [
                    'id' => 1,
                    'name' => 'Roger Rabbit',
                    'phone' => null,
                    'periods' => [
                        [
                            'from' => Carbon::createFromFormat('Y-m-d H:i:s', '2018-12-17 09:00:00', 'UTC'),
                            'to' => Carbon::createFromFormat('Y-m-d H:i:s', '2018-12-18 22:00:00', 'UTC'),
                            'position' => 'Régisseur',
                        ],
                    ],
                ],
                [
                    'id' => 2,
                    'name' => 'Jean Technicien',
                    'phone' => '+33645698520',
                    'periods' => [
                        [
                            'from' => Carbon::createFromFormat('Y-m-d H:i:s', '2018-12-18 14:00:00', 'UTC'),
                            'to' => Carbon::createFromFormat('Y-m-d H:i:s', '2018-12-18 18:00:00', 'UTC'),
                            'position' => 'Technicien plateau',
                        ],
                    ],
                ],
            ],
            'customText' => [
                'title' => 'Contrat',
                'content' => 'Un petit contrat de test.',
            ],
            'showLegalNumbers' => true,
        ];
        $this->assertEquals($expected, $result);
    }
}
