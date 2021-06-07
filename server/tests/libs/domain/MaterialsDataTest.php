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
                        'park' => null,
                        'stockQuantity' => 1,
                        'attributes' => [],
                        'quantity' => 0,
                        'units' => [
                            ['name' => 'VHCL-1', 'park' => 'spare'],
                        ],
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 32000.0,
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
                        'attributes' => [],
                        'park' => null,
                        'quantity' => 0,
                        'units' => [
                            ['name' => 'DECOR-FOREST-1', 'park' => 'default'],
                            ['name' => 'DECOR-FOREST-2', 'park' => 'default'],
                        ],
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
                        'units' => [
                            ['name' => 'XR18-1', 'park' => 'default'],
                            ['name' => 'XR18-2', 'park' => 'default'],
                            ['name' => 'XR18-3', 'park' => 'spare'],
                        ],
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
                'id' => 1,
                'name' => 'default',
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
                        'units' => null,
                        'rentalPrice' => 25.5,
                        'replacementPrice' => 349.9,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'Decor-Forest' => [
                        'reference' => 'Decor-Forest',
                        'name' => 'Décor Thème Forêt',
                        'stockQuantity' => 2,
                        'attributes' => [],
                        'park' => null,
                        'quantity' => 2,
                        'units' => [
                            ['name' => 'DECOR-FOREST-1', 'park' => null],
                            ['name' => 'DECOR-FOREST-2', 'park' => null],
                        ],
                        'rentalPrice' => 1500.0,
                        'replacementPrice' => 8500.0,
                        'total' => 3000.0,
                        'totalReplacementPrice' => 17000.0,
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
                        'attributes' => [],
                        'park' => null,
                        'quantity' => 0,
                        'units' => null,
                        'rentalPrice' => 0.5,
                        'replacementPrice' => 9.5,
                        'total' => 0.0,
                        'totalReplacementPrice' => 0.0,
                    ],
                    'XR18' => [
                        'reference' => 'XR18',
                        'name' => 'Behringer X Air XR18',
                        'stockQuantity' => 3,
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
                        'quantity' => 2,
                        'units' => [
                            ['name' => 'XR18-1', 'park' => null],
                            ['name' => 'XR18-2', 'park' => null],
                        ],
                        'rentalPrice' => 49.99,
                        'replacementPrice' => 419.0,
                        'total' => 99.98,
                        'totalReplacementPrice' => 838.0,
                    ],
                ],
            ],
            [
                'id' => 2,
                'name' => 'spare',
                'materials' => [
                    'Transporter' => [
                        'reference' => 'Transporter',
                        'name' => 'Volkswagen Transporter',
                        'stockQuantity' => 1,
                        'attributes' => [],
                        'park' => null,
                        'quantity' => 1,
                        'units' => [
                            ['name' => 'VHCL-1', 'park' => null],
                        ],
                        'rentalPrice' => 300.0,
                        'replacementPrice' => 32000.0,
                        'total' => 300.0,
                        'totalReplacementPrice' => 32000.0,
                    ],
                    'XR18' => [
                        'reference' => 'XR18',
                        'name' => 'Behringer X Air XR18',
                        'stockQuantity' => 3,
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
                        'quantity' => 1,
                        'units' => [
                            ['name' => 'XR18-3', 'park' => null],
                        ],
                        'rentalPrice' => 49.99,
                        'replacementPrice' => 419.0,
                        'total' => 49.99,
                        'totalReplacementPrice' => 419.0,
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
                'units' => null,
                'rentalPrice' => 25.5,
                'replacementPrice' => 349.9,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
            'Decor-Forest' => [
                'reference' => 'Decor-Forest',
                'name' => 'Décor Thème Forêt',
                'stockQuantity' => 2,
                'attributes' => [],
                'park' => null,
                'quantity' => 0,
                'units' => [
                    ['name' => 'DECOR-FOREST-1', 'park' => 'default'],
                    ['name' => 'DECOR-FOREST-2', 'park' => 'default'],
                ],
                'rentalPrice' => 1500.0,
                'replacementPrice' => 8500.0,
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
                'units' => null,
                'rentalPrice' => 15.95,
                'replacementPrice' => 59.0,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
            'Transporter' => [
                'reference' => 'Transporter',
                'name' => 'Volkswagen Transporter',
                'stockQuantity' => 1,
                'attributes' => [],
                'park' => null,
                'quantity' => 0,
                'units' => [
                    ['name' => 'VHCL-1', 'park' => 'spare'],
                ],
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
                'units' => null,
                'rentalPrice' => 0.5,
                'replacementPrice' => 9.5,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
            'XR18' => [
                'reference' => 'XR18',
                'name' => 'Behringer X Air XR18',
                'stockQuantity' => 3,
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
                'units' => [
                    ['name' => 'XR18-1', 'park' => 'default'],
                    ['name' => 'XR18-2', 'park' => 'default'],
                    ['name' => 'XR18-3', 'park' => 'spare'],
                ],
                'rentalPrice' => 49.99,
                'replacementPrice' => 419.0,
                'total' => 0.0,
                'totalReplacementPrice' => 0.0,
            ],
        ];
        $this->assertEquals($expected, $result);
    }
}
