<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\Lib\Domain\EventData;
use Robert2\API\Config\Config;
use Robert2\API\Models\Event;
use Robert2\API\Models\Category;
use Robert2\API\Models\Park;
use Robert2\Fixtures\RobertFixtures;

final class EventDataWithUnitsTest extends ModelTestCase
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
                ->with('Beneficiaries')
                ->with('Materials')
                ->find(4);
            if (!$event) {
                $this->fail("Unable to find event's data");
            }

            $this->_event = $event->toArray();
            $this->_event['beneficiaries'] = [
                ['id' => 1, 'first_name' => 'Fake', 'last_name' => 'Benef'],
            ];

            $this->_number = sprintf('%s-00002', $this->_date->format('Y'));

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
    // -    Getters tests methods
    // -
    // ------------------------------------------------------

    public function testGetMaterialBySubCategories()
    {
        $result = $this->EventData->getMaterialBySubCategories();
        $expected = [
            [
                'id' => 1,
                'name' => 'mixers',
                'materials' => [
                    'XR18' => [
                        'reference' => 'XR18',
                        'name' => 'Behringer X Air XR18',
                        'stockQuantity' => 2,
                        'park' => null,
                        'units' => [
                            ['name' => 'XR18-1', 'park' => 'default'],
                            ['name' => 'XR18-3', 'park' => 'spare'],
                        ],
                        'quantity' => 2,
                        'rentalPrice' => 49.99,
                        'replacementPrice' => 419.0,
                        'total' => 99.98,
                        'totalReplacementPrice' => 838.0,
                    ],
                    'CL3' => [
                        'reference' => 'CL3',
                        'name' => 'Console Yamaha CL3',
                        'stockQuantity' => 5,
                        'park' => 'default',
                        'units' => null,
                        'quantity' => 1,
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 19400.0,
                        'total' => 300.0,
                        'totalReplacementPrice' => 19400.0,
                    ],
                ],
            ],
            [
                'id' => null,
                'name' => null,
                'materials' => [
                    'Transporter' => [
                        'reference' => 'Transporter',
                        'name' => 'Volkswagen Transporter',
                        'stockQuantity' => 1,
                        'park' => null,
                        'units' => [
                            ['name' => 'VHCL-1', 'park' => 'spare'],
                        ],
                        'quantity' => 3,
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 32000.0,
                        'total' => 900.0,
                        'totalReplacementPrice' => 96000.0,
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
                    'XR18' => [
                        'reference' => 'XR18',
                        'name' => 'Behringer X Air XR18',
                        'stockQuantity' => 3,
                        'park' => null,
                        'units' => [
                            ['name' => 'XR18-1', 'park' => null],
                        ],
                        'quantity' => 1,
                        'rentalPrice' => 49.99,
                        'replacementPrice' => 419.0,
                        'total' => 49.99,
                        'totalReplacementPrice' => 419.0,
                    ],
                    'CL3' => [
                        'reference' => 'CL3',
                        'name' => 'Console Yamaha CL3',
                        'stockQuantity' => 5,
                        'park' => null,
                        'units' => null,
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
                'name' => 'spare',
                'materials' => [
                    'XR18' => [
                        'reference' => 'XR18',
                        'name' => 'Behringer X Air XR18',
                        'stockQuantity' => 3,
                        'park' => null,
                        'units' => [
                            ['name' => 'XR18-3', 'park' => null],
                        ],
                        'quantity' => 1,
                        'rentalPrice' => 49.99,
                        'replacementPrice' => 419.0,
                        'total' => 49.99,
                        'totalReplacementPrice' => 419.0,
                    ],
                    'Transporter' => [
                        'reference' => 'Transporter',
                        'name' => 'Volkswagen Transporter',
                        'stockQuantity' => 1,
                        'park' => null,
                        'units' => [
                            ['name' => 'VHCL-1', 'park' => null],
                        ],
                        'quantity' => 1,
                        'rentalPrice' => 300,
                        'replacementPrice' => 32000,
                        'total' => 300,
                        'totalReplacementPrice' => 32000,
                    ],
                ],
            ],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetMaterials()
    {
        $result = $this->EventData->getMaterials();
        $expected = [
            [
                'id' => 7,
                'reference' => 'Transporter',
                'name' => 'Volkswagen Transporter',
                'park_id' => null,
                'category_id' => 3,
                'sub_category_id' => null,
                'rental_price' => 300.0,
                'replacement_price' => 32000.0,
                'is_hidden_on_bill' => false,
                'is_discountable' => false,
                'quantity' => 3,
            ],
            [
                'id' => 6,
                'reference' => 'XR18',
                'name' => 'Behringer X Air XR18',
                'park_id' => null,
                'category_id' => 1,
                'sub_category_id' => 1,
                'rental_price' => 49.99,
                'replacement_price' => 419.0,
                'is_hidden_on_bill' => false,
                'is_discountable' => false,
                'quantity' => 2,
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
            'event_id' => 4,
            'beneficiary_id' => 1,
            'materials' => [
                [
                    'id' => 7,
                    'reference' => 'Transporter',
                    'name' => 'Volkswagen Transporter',
                    'park_id' => null,
                    'category_id' => 3,
                    'sub_category_id' => null,
                    'rental_price' => 300.0,
                    'replacement_price' => 32000.0,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => false,
                    'quantity' => 3,
                ],
                [
                    'id' => 6,
                    'reference' => 'XR18',
                    'name' => 'Behringer X Air XR18',
                    'park_id' => null,
                    'category_id' => 1,
                    'sub_category_id' => 1,
                    'rental_price' => 49.99,
                    'replacement_price' => 419.0,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => false,
                    'quantity' => 2,
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
            'degressive_rate' => '31',
            'discount_rate' => '0',
            'vat_rate' => '20',
            'due_amount' => '40299.38',
            'replacement_amount' => '116238',
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
            'dailyAmount' => 1299.98,
            'discountableDailyAmount' => 0.0,
            'daysCount' => 41,
            'degressiveRate' => 31.0,
            'discountRate' => 0.0,
            'discountAmount' => 0.0,
            'vatRate' => 0.2,
            'vatAmount' => 260.0,
            'totalDailyExclVat' => 1299.98,
            'totalDailyInclVat' => 1559.98,
            'totalExclVat' => 40299.38,
            'totalInclVat' => 48359.26,
            'totalReplacement' => 116238.0,
            'categoriesSubTotals' => [
                ['id' => 3, 'name' => "transport", 'quantity' => 3, 'subTotal' => 900.0],
                ['id' => 1, 'name' => "sound", 'quantity' => 3, 'subTotal' => 399.98],
            ],
            'materialList' => [
                [
                    'id' => 1,
                    'name' => 'mixers',
                    'materials' => [
                        'XR18' => [
                            'reference' => 'XR18',
                            'name' => 'Behringer X Air XR18',
                            'stockQuantity' => 2,
                            'park' => null,
                            'units' => [
                                ['name' => 'XR18-1', 'park' => 'default'],
                                ['name' => 'XR18-3', 'park' => 'spare'],
                            ],
                            'quantity' => 2,
                            'rentalPrice' => 49.99,
                            'replacementPrice' => 419.0,
                            'total' => 99.98,
                            'totalReplacementPrice' => 838.0,
                        ],
                        'CL3' => [
                            'reference' => 'CL3',
                            'name' => 'Console Yamaha CL3',
                            'stockQuantity' => 5,
                            'park' => 'default',
                            'units' => null,
                            'quantity' => 1,
                            'rentalPrice' => 300.0,
                            'replacementPrice' => 19400.0,
                            'total' => 300.0,
                            'totalReplacementPrice' => 19400.0,
                        ],
                    ],
                ],
                [
                    'id' => null,
                    'name' => null,
                    'materials' => [
                        'Transporter' => [
                            'reference' => 'Transporter',
                            'name' => 'Volkswagen Transporter',
                            'stockQuantity' => 1,
                            'park' => null,
                            'units' => [
                                ['name' => 'VHCL-1', 'park' => 'spare'],
                            ],
                            'quantity' => 3,
                            'rentalPrice' => 300.0,
                            'replacementPrice' => 32000.0,
                            'total' => 900.0,
                            'totalReplacementPrice' => 96000.0,
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
