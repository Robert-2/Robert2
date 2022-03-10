<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\Lib\Domain\EventData;
use Robert2\API\Config\Config;
use Robert2\API\Models\Event;
use Robert2\API\Models\Category;
use Robert2\API\Models\Park;
use Robert2\Fixtures\RobertFixtures;

final class EventDataTest extends ModelTestCase
{
    public $EventData;

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
            $this->fail(sprintf("Unable to reset fixtures: %s", $e->getMessage()));
        }

        try {
            $this->_date = new \DateTime();

            $event = (new Event())
                ->with('Technicians')
                ->with('Beneficiaries')
                ->with('Materials')
                ->find(1);
            if (!$event) {
                $this->fail("Unable to find event's data");
            }

            $this->_event = $event->toArray();

            $this->_number = sprintf('%s-00001', $this->_date->format('Y'));

            $this->EventData = new EventData($this->_date, $this->_event, $this->_number, 1);
            $this->EventData
                ->setCategories((new Category())->getAll()->get()->toArray())
                ->setParks((new Park())->getAll()->get()->toArray());
        } catch (\Exception $e) {
            $this->fail($e->getMessage());
        }
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
        new EventData($this->_date, [], $this->_number);
    }

    public function testNoBeneficiary()
    {
        $event = [
            'id' => 99,
            'title' => "fake event",
            'start_date' => "2021-04-21 00:00:00",
            'end_date' => "2021-04-21 23:59:59",
            'beneficiaries' => [],
            'materials' => [
                ['id' => 4, 'name' => 'Showtec SDS-6', 'reference' => 'SDS-6-01'],
            ],
        ];
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Cannot create EventData value-object without complete event's data.");
        new EventData($this->_date, $event, $this->_number);
    }

    public function testNoMaterials()
    {
        $event = [
            'id' => 99,
            'title' => "fake event",
            'start_date' => "2021-04-21 00:00:00",
            'end_date' => "2021-04-21 23:59:59",
            'beneficiaries' => [
                ['id' => 3, 'first_name' => 'Client', 'last_name' => 'Benef'],
            ],
            'materials' => [],
        ];
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Cannot create EventData value-object without complete event's data.");
        new EventData($this->_date, $event, $this->_number);
    }

    // ------------------------------------------------------
    // -
    // -    Setters tests methods
    // -
    // ------------------------------------------------------

    public function testSetDiscountRate()
    {
        $this->EventData->setDiscountRate(33.33);
        $this->assertEquals(33.33, $this->EventData->discountRate);
    }

    public function testCreateBillNumber()
    {
        $date = new \DateTime();

        $result = EventData::createBillNumber($date, 1);
        $this->assertEquals(sprintf('%s-00002', date('Y')), $result);

        $result = EventData::createBillNumber($date, 155);
        $this->assertEquals(sprintf('%s-00156', date('Y')), $result);
    }

    // ------------------------------------------------------
    // -
    // -    Getters tests methods
    // -
    // ------------------------------------------------------

    public function testGetDailyAmount()
    {
        $this->assertEquals(341.45, $this->EventData->getDailyAmount());
    }

    public function testGetDiscountableDailyAmount()
    {
        $this->assertEquals(41.45, $this->EventData->getDiscountableDailyAmount());
    }

    public function testGetReplacementAmount()
    {
        $this->assertEquals(19808.9, $this->EventData->getReplacementAmount());
    }

    public function testGetCategoriesTotals()
    {
        $result = $this->EventData->getCategoriesTotals();
        $expected = [
            ['id' => 2, 'name' => "light", 'quantity' => 1, 'subTotal' => 15.95],
            ['id' => 1, 'name' => "sound", 'quantity' => 2, 'subTotal' => 325.5],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetMaterialByCategories()
    {
        $result = $this->EventData->getMaterialByCategories();
        $expected = [
            [
                'id' => 1,
                'name' => 'sound',
                'categoryHasSubcategories' => true,
                'materials' => [
                    'CL3' => [
                        'reference' => 'CL3',
                        'name' => 'Console Yamaha CL3',
                        'stockQuantity' => 5,
                        'attributes' => [
                            ['id' => 3, 'name' => 'Puissance', 'type' => 'integer', 'value' => 850, 'unit' => 'W'],
                            ['id' => 2, 'name' => 'Couleur', 'type' => 'string', 'value' => 'Grise', 'unit' => null],
                            ['id' => 1, 'name' => 'Poids', 'type' => 'float', 'value' => 36.5, 'unit' => 'kg'],
                        ],
                        'park' => 'default',
                        'quantity' => 1,
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 19400.0,
                        'total' => 300.0,
                        'totalReplacementPrice' => 19400.0,
                    ],
                    'DBXPA2' => [
                        'reference' => 'DBXPA2',
                        'name' => 'Processeur DBX PA2',
                        'stockQuantity' => 2,
                        'attributes' => [
                            ['id' => 3, 'name' => 'Puissance', 'type' => 'integer', 'value' => 35, 'unit' => 'W'],
                            ['id' => 1, 'name' => 'Poids', 'type' => 'float', 'value' => 2.2, 'unit' => 'kg'],
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
            [
                'id' => 2,
                'name' => 'light',
                'categoryHasSubcategories' => true,
                'materials' => [
                    'SDS-6-01' => [
                        'reference' => 'SDS-6-01',
                        'name' => 'Showtec SDS-6',
                        'stockQuantity' => 2,
                        'attributes' => [
                            ['id' => 4, 'name' => 'Conforme', 'type' => 'boolean', 'value' => true, 'unit' => null],
                            ['id' => 3, 'name' => 'Puissance', 'type' => 'integer', 'value' => 60, 'unit' => 'W'],
                            ['id' => 1, 'name' => 'Poids', 'type' => 'float', 'value' => 3.15, 'unit' => 'kg'],
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
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetMaterialBySubCategories()
    {
        $result = $this->EventData->getMaterialBySubCategories();
        $expected = [
            [
                'id' => 4,
                'name' => 'dimmers',
                'category' => 'light',
                'categoryHasSubcategories' => true,
                'materials' => [
                    'SDS-6-01' => [
                        'reference' => 'SDS-6-01',
                        'name' => 'Showtec SDS-6',
                        'stockQuantity' => 2,
                        'attributes' => [
                            ['id' => 4, 'name' => 'Conforme', 'type' => 'boolean', 'value' => true, 'unit' => null],
                            ['id' => 3, 'name' => 'Puissance', 'type' => 'integer', 'value' => 60, 'unit' => 'W'],
                            ['id' => 1, 'name' => 'Poids', 'type' => 'float', 'value' => 3.15, 'unit' => 'kg'],
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
            [
                'id' => 1,
                'name' => 'mixers',
                'category' => 'sound',
                'categoryHasSubcategories' => true,
                'materials' => [
                    'CL3' => [
                        'reference' => 'CL3',
                        'name' => 'Console Yamaha CL3',
                        'stockQuantity' => 5,
                        'attributes' => [
                            ['id' => 3, 'name' => 'Puissance', 'type' => 'integer', 'value' => 850, 'unit' => 'W'],
                            ['id' => 2, 'name' => 'Couleur', 'type' => 'string', 'value' => 'Grise', 'unit' => null],
                            ['id' => 1, 'name' => 'Poids', 'type' => 'float', 'value' => 36.5, 'unit' => 'kg'],
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
            [
                'id' => 2,
                'name' => 'processors',
                'category' => 'sound',
                'categoryHasSubcategories' => true,
                'materials' => [
                    'DBXPA2' => [
                        'reference' => 'DBXPA2',
                        'name' => 'Processeur DBX PA2',
                        'stockQuantity' => 2,
                        'attributes' => [
                            ['id' => 3, 'name' => 'Puissance', 'type' => 'integer', 'value' => 35, 'unit' => 'W'],
                            ['id' => 1, 'name' => 'Poids', 'type' => 'float', 'value' => 2.2, 'unit' => 'kg'],
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
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetMaterialByParks()
    {
        $result = $this->EventData->getMaterialByParks();
        $expected = [
            [
                'id' => 1,
                'name' => 'default',
                'materials' => [
                    'CL3' => [
                        'reference' => 'CL3',
                        'name' => 'Console Yamaha CL3',
                        'stockQuantity' => 5,
                        'attributes' => [
                            ['id' => 3, 'name' => 'Puissance', 'type' => 'integer', 'value' => 850, 'unit' => 'W'],
                            ['id' => 2, 'name' => 'Couleur', 'type' => 'string', 'value' => 'Grise', 'unit' => null],
                            ['id' => 1, 'name' => 'Poids', 'type' => 'float', 'value' => 36.5, 'unit' => 'kg'],
                        ],
                        'park' => null,
                        'quantity' => 1,
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 19400.0,
                        'total' => 300.0,
                        'totalReplacementPrice' => 19400.0,
                    ],
                    'DBXPA2' => [
                        'reference' => 'DBXPA2',
                        'name' => 'Processeur DBX PA2',
                        'stockQuantity' => 2,
                        'attributes' => [
                            ['id' => 3, 'name' => 'Puissance', 'type' => 'integer', 'value' => 35, 'unit' => 'W'],
                            ['id' => 1, 'name' => 'Poids', 'type' => 'float', 'value' => 2.2, 'unit' => 'kg'],
                        ],
                        'park' => null,
                        'quantity' => 1,
                        'rentalPrice' => 25.5,
                        'replacementPrice' => 349.9,
                        'total' => 25.5,
                        'totalReplacementPrice' => 349.9,
                    ],
                    'SDS-6-01' => [
                        'reference' => 'SDS-6-01',
                        'name' => 'Showtec SDS-6',
                        'stockQuantity' => 2,
                        'attributes' => [
                            ['id' => 4, 'name' => 'Conforme', 'type' => 'boolean', 'value' => true, 'unit' => null],
                            ['id' => 3, 'name' => 'Puissance', 'type' => 'integer', 'value' => 60, 'unit' => 'W'],
                            ['id' => 1, 'name' => 'Poids', 'type' => 'float', 'value' => 3.15, 'unit' => 'kg'],
                        ],
                        'park' => null,
                        'quantity' => 1,
                        'rentalPrice' => 15.95,
                        'replacementPrice' => 59.0,
                        'total' => 15.95,
                        'totalReplacementPrice' => 59.0,
                    ],
                ],
            ],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetMaterialsFlat()
    {
        $result = $this->EventData->getMaterialsFlat();
        $expected = [
            'CL3' => [
                'name' => 'Console Yamaha CL3',
                'reference' => 'CL3',
                'stockQuantity' => 5,
                'attributes' => [
                    ['id' => 3, 'name' => 'Puissance', 'type' => 'integer', 'value' => 850, 'unit' => 'W'],
                    ['id' => 2, 'name' => 'Couleur', 'type' => 'string', 'value' => 'Grise', 'unit' => null],
                    ['id' => 1, 'name' => 'Poids', 'type' => 'float', 'value' => 36.5, 'unit' => 'kg'],
                ],
                'park' => 'default',
                'quantity' => 1,
                'rentalPrice' => 300.0,
                'total' => 300.0,
                'replacementPrice' => 19400.0,
                'totalReplacementPrice' => 19400.0,
            ],
            'DBXPA2' => [
                'name' => 'Processeur DBX PA2',
                'reference' => 'DBXPA2',
                'stockQuantity' => 2,
                'attributes' => [
                    ['id' => 3, 'name' => 'Puissance', 'type' => 'integer', 'value' => 35, 'unit' => 'W'],
                    ['id' => 1, 'name' => 'Poids', 'type' => 'float', 'value' => 2.2, 'unit' => 'kg'],
                ],
                'park' => 'default',
                'quantity' => 1,
                'rentalPrice' => 25.5,
                'total' => 25.5,
                'replacementPrice' => 349.9,
                'totalReplacementPrice' => 349.9,
            ],
            'SDS-6-01' => [
                'name' => 'Showtec SDS-6',
                'reference' => 'SDS-6-01',
                'stockQuantity' => 2,
                'attributes' => [
                    ['id' => 4, 'name' => 'Conforme', 'type' => 'boolean', 'value' => true, 'unit' => null],
                    ['id' => 3, 'name' => 'Puissance', 'type' => 'integer', 'value' => 60, 'unit' => 'W'],
                    ['id' => 1, 'name' => 'Poids', 'type' => 'float', 'value' => 3.15, 'unit' => 'kg'],
                ],
                'park' => 'default',
                'quantity' => 1,
                'rentalPrice' => 15.95,
                'total' => 15.95,
                'replacementPrice' => 59.0,
                'totalReplacementPrice' => 59.0,
            ],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetMaterials()
    {
        $result = $this->EventData->getMaterials();
        $expected = [
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
                'quantity' => 1,
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
        ];
        $this->assertEquals($expected, $result);
    }

    public function testToModelArray()
    {
        $result = $this->EventData->toModelArray();
        $expected = [
            'number' => $this->_number,
            'date' => $this->_date->format('Y-m-d H:i:s'),
            'event_id' => 1,
            'beneficiary_id' => 3,
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

    public function testToModelArrayWithDiscount()
    {
        $this->EventData->setDiscountRate(33.33);
        $result = $this->EventData->toModelArray();
        $expected = [
            'number' => $this->_number,
            'date' => $this->_date->format('Y-m-d H:i:s'),
            'event_id' => 1,
            'beneficiary_id' => 3,
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
            'degressive_rate' => 1.75,
            'discount_rate' => 33.33,
            'vat_rate' => 20.0,
            'due_amount' => 573.36,
            'replacement_amount' => 19808.9,
            'currency' => Config::getSettings('currency')['iso'],
            'user_id' => 1,
        ];
        $this->assertEquals($expected, $result);
    }

    public function testToPdfTemplateArray()
    {
        $result = $this->EventData->toPdfTemplateArray();
        $expected = [
            'number' => $this->_number,
            'date' => $this->_date,
            'event' => $this->_event,
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
                ['id' => 2, 'name' => "light", 'quantity' => 1, 'subTotal' => 15.95],
                ['id' => 1, 'name' => "sound", 'quantity' => 2, 'subTotal' => 325.5],
            ],
            'materialList' => [
                [
                    'id' => 4,
                    'name' => "dimmers",
                    'category' => 'light',
                    'categoryHasSubcategories' => true,
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
                [
                    'id' => 1,
                    'name' => "mixers",
                    'category' => 'sound',
                    'categoryHasSubcategories' => true,
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
                [
                    'id' => 2,
                    'name' => "processors",
                    'category' => 'sound',
                    'categoryHasSubcategories' => true,
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
            ],
            'company' => Config::getSettings('companyData'),
            'locale' => Config::getSettings('defaultLang'),
            'currency' => Config::getSettings('currency')['iso'],
            'currencyName' => Config::getSettings('currency')['name'],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetTechnicians()
    {
        $result = $this->EventData->getTechnicians();
        $expected = [
            [
                'id' => 1,
                'name' => 'Jean Fountain',
                'phone' => null,
                'periods' => [
                    [
                        'from' => '2018-12-17 09:00:00',
                        'to' => '2018-12-18 22:00:00',
                        'position' => 'Régisseur',
                    ]
                ],
            ],
            [
                'id' => 2,
                'name' => 'Roger Rabbit',
                'phone' => null,
                'periods' => [
                    [
                        'from' => '2018-12-18 14:00:00',
                        'to' => '2018-12-18 18:00:00',
                        'position' => 'Technicien plateau',
                    ]
                ],
            ],
        ];
        $this->assertEquals($expected, $result);
    }
}
