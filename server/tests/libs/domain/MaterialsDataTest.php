<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\Lib\Domain\MaterialsData;
use Robert2\API\Models\Material;
use Robert2\API\Models\Category;
use Robert2\API\Models\Park;
use Robert2\Fixtures\RobertFixtures;

final class MaterialsDataTest extends ModelTestCase
{
    public function setUp(): void
    {
        parent::setUp();

        // - Reset fixtures (needed to load materials' data)
        try {
            RobertFixtures::resetDataWithDump();
        } catch (\Exception $e) {
            $this->fail(sprintf("Unable to reset fixtures: %s", $e->getMessage()));
        }

        try {
            $this->_date = new \DateTime();

            $materials = (new Material())->get()->toArray();
            if (!$materials || count($materials) === 0) {
                $this->fail("Unable to find materials' data");
            }

            $this->MaterialsData = new MaterialsData($materials);
            $this->MaterialsData
                ->setCategories(Category::get()->toArray())
                ->setParks(Park::get()->toArray());
        } catch (\Exception $e) {
            $this->fail($e->getMessage());
        }
    }

    public function testGetBySubCategories()
    {
        $result = $this->MaterialsData->getBySubCategories();
        $expected = [
            [
                'id' => null,
                'name' => null,
                'materials' => [
                    'Transporter' => [
                        'reference' => 'Transporter',
                        'name' => 'Volkswagen Transporter',
                        'stockQuantity' => 1,
                        'park' => null,
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 32000.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'XLR10' => [
                        'reference' => 'XLR10',
                        'name' => 'Câble XLR 10m',
                        'stockQuantity' => 40,
                        'park' => 'default',
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 0.5,
                        'replacementPrice' => 9.5,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'Decor-Forest' => [
                        'reference' => 'Decor-Forest',
                        'name' => 'Décor Thème Forêt',
                        'stockQuantity' => 2,
                        'park' => null,
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 1500.0,
                        'replacementPrice' => 8500.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                ],
            ],
            [
                'id' => 4,
                'name' => 'dimmers',
                'materials' => [
                    'SDS-6-01' => [
                        'reference' => 'SDS-6-01',
                        'name' => 'Showtec SDS-6',
                        'stockQuantity' => 2,
                        'park' => 'default',
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 15.95,
                        'replacementPrice' => 59.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                ],
            ],
            [
                'id' => 3,
                'name' => 'projectors',
                'materials' => [
                    'PAR64LED' => [
                        'reference' => 'PAR64LED',
                        'name' => 'PAR64 LED',
                        'stockQuantity' => 34,
                        'park' => 'default',
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 3.5,
                        'replacementPrice' => 89.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                ],
            ],
            [
                'id' => 2,
                'name' => 'processors',
                'materials' => [
                    'DBXPA2' => [
                        'reference' => 'DBXPA2',
                        'name' => 'Processeur DBX PA2',
                        'stockQuantity' => 2,
                        'park' => 'default',
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 25.5,
                        'replacementPrice' => 349.9,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                ],
            ],
            [
                'id' => 1,
                'name' => 'mixers',
                'materials' => [
                    'CL3' => [
                        'reference' => 'CL3',
                        'name' => 'Console Yamaha CL3',
                        'stockQuantity' => 5,
                        'park' => 'default',
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 19400.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'XR18' => [
                        'reference' => 'XR18',
                        'name' => 'Behringer X Air XR18',
                        'stockQuantity' => 3,
                        'park' => null,
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 49.99,
                        'replacementPrice' => 419.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                ],
            ],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetByParks()
    {
        $result = $this->MaterialsData->getByParks();
        $expected = [
            [
                'id' => null,
                'name' => null,
                'materials' => [
                    'Transporter' => [
                        'reference' => 'Transporter',
                        'name' => 'Volkswagen Transporter',
                        'stockQuantity' => 1,
                        'park' => null,
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 32000.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'XR18' => [
                        'reference' => 'XR18',
                        'name' => 'Behringer X Air XR18',
                        'stockQuantity' => 3,
                        'park' => null,
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 49.99,
                        'replacementPrice' => 419.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'Decor-Forest' => [
                        'reference' => 'Decor-Forest',
                        'name' => 'Décor Thème Forêt',
                        'stockQuantity' => 2,
                        'park' => null,
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 1500.0,
                        'replacementPrice' => 8500.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                ],
            ],
            [
                'id' => 1,
                'name' => 'default',
                'materials' => [
                    'CL3' => [
                        'reference' => 'CL3',
                        'name' => 'Console Yamaha CL3',
                        'stockQuantity' => 5,
                        'park' => null,
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 19400.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'DBXPA2' => [
                        'reference' => 'DBXPA2',
                        'name' => 'Processeur DBX PA2',
                        'stockQuantity' => 2,
                        'park' => null,
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 25.5,
                        'replacementPrice' => 349.9,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'PAR64LED' => [
                        'reference' => 'PAR64LED',
                        'name' => 'PAR64 LED',
                        'stockQuantity' => 34,
                        'park' => null,
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 3.5,
                        'replacementPrice' => 89.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'SDS-6-01' => [
                        'reference' => 'SDS-6-01',
                        'name' => 'Showtec SDS-6',
                        'stockQuantity' => 2,
                        'park' => null,
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 15.95,
                        'replacementPrice' => 59.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'XLR10' => [
                        'reference' => 'XLR10',
                        'name' => 'Câble XLR 10m',
                        'stockQuantity' => 40,
                        'park' => null,
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 0.5,
                        'replacementPrice' => 9.5,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                ],
            ],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testGetAllFlat()
    {
        $result = $this->MaterialsData->getAllFlat();
        $expected = [
            'CL3' => [
                'reference' => 'CL3',
                'name' => 'Console Yamaha CL3',
                'stockQuantity' => 5,
                'park' => 'default',
                'quantity' => 0,
                'rentalPrice' => 300.0,
                'replacementPrice' => 19400.0,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
            'DBXPA2' => [
                'reference' => 'DBXPA2',
                'name' => 'Processeur DBX PA2',
                'stockQuantity' => 2,
                'park' => 'default',
                'quantity' => 0,
                'rentalPrice' => 25.5,
                'replacementPrice' => 349.9,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
            'Decor-Forest' => [
                'reference' => 'Decor-Forest',
                'name' => 'Décor Thème Forêt',
                'stockQuantity' => 2,
                'park' => null,
                'quantity' => 0,
                'rentalPrice' => 1500.0,
                'replacementPrice' => 8500.0,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
            'PAR64LED' => [
                'reference' => 'PAR64LED',
                'name' => 'PAR64 LED',
                'stockQuantity' => 34,
                'park' => 'default',
                'quantity' => 0,
                'rentalPrice' => 3.5,
                'replacementPrice' => 89.0,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
            'SDS-6-01' => [
                'reference' => 'SDS-6-01',
                'name' => 'Showtec SDS-6',
                'stockQuantity' => 2,
                'park' => 'default',
                'quantity' => 0,
                'rentalPrice' => 15.95,
                'replacementPrice' => 59.0,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
            'Transporter' => [
                'reference' => 'Transporter',
                'name' => 'Volkswagen Transporter',
                'stockQuantity' => 1,
                'park' => null,
                'quantity' => 0,
                'rentalPrice' => 300.0,
                'replacementPrice' => 32000.0,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
            'XLR10' => [
                'reference' => 'XLR10',
                'name' => 'Câble XLR 10m',
                'stockQuantity' => 40,
                'park' => 'default',
                'quantity' => 0,
                'rentalPrice' => 0.5,
                'replacementPrice' => 9.5,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
            'XR18' => [
                'reference' => 'XR18',
                'name' => 'Behringer X Air XR18',
                'stockQuantity' => 3,
                'park' => null,
                'quantity' => 0,
                'rentalPrice' => 49.99,
                'replacementPrice' => 419.0,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
        ];
        $this->assertEquals($expected, $result);
    }
}
