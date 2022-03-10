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

    public function testGetByCategories()
    {
        $result = $this->MaterialsData->getByCategories();
        $expected = [
            [
                'id' => 3,
                'name' => 'transport',
                'categoryHasSubcategories' => false,
                'materials' => [
                    'Transporter' => [
                        'reference' => 'Transporter',
                        'name' => 'Volkswagen Transporter',
                        'park' => 'default',
                        'stockQuantity' => 0,
                        'attributes' => [],
                        'quantity' => 0,
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 32000.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
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
                        'park' => 'default',
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
                        'quantity' => 0,
                        'rentalPrice' => 15.95,
                        'replacementPrice' => 59.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'PAR64LED' => [
                        'reference' => 'PAR64LED',
                        'name' => 'PAR64 LED',
                        'park' => 'default',
                        'stockQuantity' => 34,
                        'attributes' => [
                            [
                                'id' => 3,
                                'name' => 'Puissance',
                                'type' => 'integer',
                                'value' => 150,
                                'unit' => 'W',
                            ],
                            [
                                'id' => 1,
                                'name' => 'Poids',
                                'type' => 'float',
                                'value' => 0.85,
                                'unit' => 'kg',
                            ],
                        ],
                        'quantity' => 0,
                        'rentalPrice' => 3.5,
                        'replacementPrice' => 89.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                ],
            ],
            [
                'id' => 1,
                'name' => 'sound',
                'categoryHasSubcategories' => true,
                'materials' => [
                    'CL3' => [
                        'reference' => 'CL3',
                        'name' => 'Console Yamaha CL3',
                        'park' => 'default',
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
                        'quantity' => 0,
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 19400.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'XR18' => [
                        'reference' => 'XR18',
                        'name' => 'Behringer X Air XR18',
                        'stockQuantity' => 0,
                        'attributes' => [
                            [
                                'id' => 5,
                                'name' => "Date d'achat",
                                'type' => 'date',
                                'value' => '2021-01-28',
                                'unit' => null,
                            ],
                        ],
                        'park' => 'default',
                        'quantity' => 0,
                        'rentalPrice' => 49.99,
                        'replacementPrice' => 419.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'DBXPA2' => [
                        'reference' => 'DBXPA2',
                        'name' => 'Processeur DBX PA2',
                        'park' => 'default',
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
                        'quantity' => 0,
                        'rentalPrice' => 25.5,
                        'replacementPrice' => 349.9,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'XLR10' => [
                        'reference' => 'XLR10',
                        'name' => 'Câble XLR 10m',
                        'park' => 'default',
                        'stockQuantity' => 40,
                        'attributes' => [],
                        'quantity' => 0,
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

    public function testGetBySubCategories()
    {
        $result = $this->MaterialsData->getBySubCategories();
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
                        'park' => 'default',
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
                        'quantity' => 0,
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
                'category' => 'light',
                'categoryHasSubcategories' => true,
                'materials' => [
                    'PAR64LED' => [
                        'reference' => 'PAR64LED',
                        'name' => 'PAR64 LED',
                        'park' => 'default',
                        'stockQuantity' => 34,
                        'attributes' => [
                            [
                                'id' => 3,
                                'name' => 'Puissance',
                                'type' => 'integer',
                                'value' => 150,
                                'unit' => 'W',
                            ],
                            [
                                'id' => 1,
                                'name' => 'Poids',
                                'type' => 'float',
                                'value' => 0.85,
                                'unit' => 'kg',
                            ],
                        ],
                        'quantity' => 0,
                        'rentalPrice' => 3.5,
                        'replacementPrice' => 89.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
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
                        'park' => 'default',
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
                        'quantity' => 0,
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 19400.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'XR18' => [
                        'reference' => 'XR18',
                        'name' => 'Behringer X Air XR18',
                        'stockQuantity' => 0,
                        'attributes' => [
                            [
                                'id' => 5,
                                'name' => "Date d'achat",
                                'type' => 'date',
                                'value' => '2021-01-28',
                                'unit' => null,
                            ],
                        ],
                        'park' => 'default',
                        'quantity' => 0,
                        'rentalPrice' => 49.99,
                        'replacementPrice' => 419.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
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
                        'park' => 'default',
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
                        'quantity' => 0,
                        'rentalPrice' => 25.5,
                        'replacementPrice' => 349.9,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                ],
            ],
            [
                'id' => 'c-1',
                'name' => null,
                'category' => 'sound',
                'categoryHasSubcategories' => true,
                'materials' => [
                    'XLR10' => [
                        'reference' => 'XLR10',
                        'name' => 'Câble XLR 10m',
                        'park' => 'default',
                        'stockQuantity' => 40,
                        'attributes' => [],
                        'quantity' => 0,
                        'rentalPrice' => 0.5,
                        'replacementPrice' => 9.5,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                ],
            ],
            [
                'id' => 'c-3',
                'name' => null,
                'category' => 'transport',
                'categoryHasSubcategories' => false,
                'materials' => [
                    'Transporter' => [
                        'reference' => 'Transporter',
                        'name' => 'Volkswagen Transporter',
                        'park' => 'default',
                        'stockQuantity' => 0,
                        'attributes' => [],
                        'quantity' => 0,
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 32000.0,
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
                'id' => 1,
                'name' => 'default',
                'materials' => [
                    'Transporter' => [
                        'reference' => 'Transporter',
                        'name' => 'Volkswagen Transporter',
                        'stockQuantity' => 0,
                        'attributes' => [],
                        'park' => null,
                        'quantity' => 0,
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 32000.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'XR18' => [
                        'reference' => 'XR18',
                        'name' => 'Behringer X Air XR18',
                        'stockQuantity' => 0,
                        'attributes' => [
                            [
                                'id' => 5,
                                'name' => "Date d'achat",
                                'type' => 'date',
                                'value' => '2021-01-28',
                                'unit' => null,
                            ],
                        ],
                        'park' => null,
                        'quantity' => 0,
                        'rentalPrice' => 49.99,
                        'replacementPrice' => 419,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'CL3' => [
                        'reference' => 'CL3',
                        'name' => 'Console Yamaha CL3',
                        'park' => null,
                        'quantity' => 0,
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
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 19400.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
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
                        'park' => null,
                        'quantity' => 0,
                        'rentalPrice' => 25.5,
                        'replacementPrice' => 349.9,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'PAR64LED' => [
                        'reference' => 'PAR64LED',
                        'name' => 'PAR64 LED',
                        'stockQuantity' => 34,
                        'attributes' => [
                            [
                                'id' => 3,
                                'name' => 'Puissance',
                                'type' => 'integer',
                                'value' => 150,
                                'unit' => 'W',
                            ],
                            [
                                'id' => 1,
                                'name' => 'Poids',
                                'type' => 'float',
                                'value' => 0.85,
                                'unit' => 'kg',
                            ],
                        ],
                        'park' => null,
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
                        'park' => null,
                        'quantity' => 0,
                        'rentalPrice' => 15.95,
                        'replacementPrice' => 59.0,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'XLR10' => [
                        'reference' => 'XLR10',
                        'name' => 'Câble XLR 10m',
                        'stockQuantity' => 40,
                        'attributes' => [],
                        'park' => null,
                        'quantity' => 0,
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
                'quantity' => 0,
                'rentalPrice' => 25.5,
                'replacementPrice' => 349.9,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
            'PAR64LED' => [
                'reference' => 'PAR64LED',
                'name' => 'PAR64 LED',
                'stockQuantity' => 34,
                'attributes' => [
                    [
                        'id' => 3,
                        'name' => 'Puissance',
                        'type' => 'integer',
                        'value' => 150,
                        'unit' => 'W',
                    ],
                    [
                        'id' => 1,
                        'name' => 'Poids',
                        'type' => 'float',
                        'value' => 0.85,
                        'unit' => 'kg',
                    ],
                ],
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
                'quantity' => 0,
                'rentalPrice' => 15.95,
                'replacementPrice' => 59.0,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
            'Transporter' => [
                'reference' => 'Transporter',
                'name' => 'Volkswagen Transporter',
                'stockQuantity' => 0,
                'attributes' => [],
                'park' => 'default',
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
                'attributes' => [],
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
                'stockQuantity' => 0,
                'attributes' => [
                    [
                        'id' => 5,
                        'name' => "Date d'achat",
                        'type' => 'date',
                        'value' => '2021-01-28',
                        'unit' => null,
                    ],
                ],
                'park' => 'default',
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
