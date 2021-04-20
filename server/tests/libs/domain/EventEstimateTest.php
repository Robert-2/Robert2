<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\Lib\Domain\EventEstimate;
use Robert2\API\Config\Config;
use Robert2\API\Models\Event;
use Robert2\API\Models\Category;
use Robert2\Fixtures\RobertFixtures;

final class EventEstimateTest extends ModelTestCase
{
    public $EventEstimate;

    protected $_date;
    protected $_eventData;
    protected $_categories;

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
                ->with('Beneficiaries')
                ->with('Materials')
                ->find(1);
            if (!$event) {
                $this->fail("Unable to find event's data");
            }
            $this->_eventData = $event->toArray();

            $this->_categories = (new Category())->getAll()->get()->toArray();

            $this->EventEstimate = new EventEstimate($this->_date, $this->_eventData, 1);
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
        $this->expectExceptionCode(0);
        $this->expectExceptionMessage("Cannot create EventEstimate value-object without complete event's data.");
        $empty = new EventEstimate($this->_date, []);
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
        $this->expectExceptionCode(0);
        $this->expectExceptionMessage("Cannot create EventEstimate value-object without complete event's data.");
        $noBeneficiaries = new EventEstimate($this->_date, $event);
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
        $this->expectExceptionCode(0);
        $this->expectExceptionMessage("Cannot create EventEstimate value-object without complete event's data.");
        $noMaterials = new EventEstimate($this->_date, $event);
    }

    // ------------------------------------------------------
    // -
    // -    Setters tests methods
    // -
    // ------------------------------------------------------

    public function testSetDiscountRate()
    {
        $this->EventEstimate->setDiscountRate(33.33);
        $this->assertEquals(33.33, $this->EventEstimate->discountRate);
    }

    // ------------------------------------------------------
    // -
    // -    Getters tests methods
    // -
    // ------------------------------------------------------

    public function testGetDailyAmount()
    {
        $this->assertEquals(341.45, $this->EventEstimate->getDailyAmount());
    }

    public function testGetDiscountableDailyAmount()
    {
        $this->assertEquals(41.45, $this->EventEstimate->getDiscountableDailyAmount());
    }

    public function testGetReplacementAmount()
    {
        $this->assertEquals(19808.9, $this->EventEstimate->getReplacementAmount());
    }

    public function testGetCategoriesTotals()
    {
        $result = $this->EventEstimate->getCategoriesTotals($this->_categories);
        $expected = [
            ['id' => 2, 'name' => "light", 'quantity' => 1, 'subTotal' => 15.95],
            ['id' => 1, 'name' => "sound", 'quantity' => 2, 'subTotal' => 325.5],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetMaterialBySubCategories()
    {
        $result = $this->EventEstimate->getMaterialBySubCategories($this->_categories);
        $expected = [
            [
                'id' => 1,
                'name' => 'mixers',
                'materials' => [
                    [
                        'reference' => 'CL3',
                        'name' => 'Console Yamaha CL3',
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
                'materials' => [
                    [
                        'reference' => 'DBXPA2',
                        'name' => 'Processeur DBX PA2',
                        'quantity' => 1,
                        'rentalPrice' => 25.5,
                        'replacementPrice' => 349.9,
                        'total' => 25.5,
                        'totalReplacementPrice' => 349.9,
                    ],
                ],
            ],
            [
                'id' => 4,
                'name' => 'dimmers',
                'materials' => [
                    [
                        'reference' => 'SDS-6-01',
                        'name' => 'Showtec SDS-6',
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

    public function testGetMaterials()
    {
        $result = $this->EventEstimate->getMaterials();
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
        $result = $this->EventEstimate->toModelArray();
        $expected = [
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
            'discount_rate' => 0.0,
            'vat_rate' => 20.0,
            'due_amount' => 597.54,
            'replacement_amount' => 19808.9,
            'currency' => Config::getSettings('currency')['iso'],
            'user_id' => 1,
        ];
        $this->assertEquals($expected, $result);
    }

    public function testToModelArrayWithDiscount()
    {
        $this->EventEstimate->setDiscountRate(33.33);
        $result = $this->EventEstimate->toModelArray();
        $expected = [
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
        $result = $this->EventEstimate->toPdfTemplateArray($this->_categories);
        $expected = [
            'date' => $this->_date,
            'event' => $this->_eventData,
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
            'materialBySubCategories' => [
                [
                    'id' => 1,
                    'name' => "mixers",
                    'materials' => [
                        [
                            'reference' => 'CL3',
                            'name' => 'Console Yamaha CL3',
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
                    'materials' => [
                        [
                            'reference' => 'DBXPA2',
                            'name' => 'Processeur DBX PA2',
                            'quantity' => 1,
                            'rentalPrice' => 25.5,
                            'replacementPrice' => 349.9,
                            'total' => 25.5,
                            'totalReplacementPrice' => 349.9,
                        ],
                    ],
                ],
                [
                    'id' => 4,
                    'name' => "dimmers",
                    'materials' => [
                        [
                            'reference' => 'SDS-6-01',
                            'name' => 'Showtec SDS-6',
                            'quantity' => 1,
                            'rentalPrice' => 15.95,
                            'replacementPrice' => 59.0,
                            'total' => 15.95,
                            'totalReplacementPrice' => 59.0,
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
}
