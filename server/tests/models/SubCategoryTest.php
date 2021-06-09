<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Errors;
use Robert2\API\Models\SubCategory;

final class SubCategoryTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new SubCategory();
    }

    public function testTableName(): void
    {
        $this->assertEquals('sub_categories', $this->model->getTable());
    }

    public function testGetAll(): void
    {
        $result = $this->model->getAll()->get()->toArray();
        $this->assertCount(4, $result);
    }

    public function testGetCategory(): void
    {
        $SubCategory = $this->model::find(1);
        $result = $SubCategory->category;
        $this->assertEquals([
            [
                'id'             => 1,
                'name'           => 'sound',
                'sub_categories' => [
                    [
                        'id'          => 1,
                        'name'        => 'mixers',
                        'category_id' => 1,
                    ],
                    [
                        'id'          => 2,
                        'name'        => 'processors',
                        'category_id' => 1,
                    ],
                ],
            ],
        ], $result);
    }

    public function testGetMaterials(): void
    {
        $SubCategory = $this->model::find(1);
        $results = $SubCategory->materials;
        $this->assertEquals([
            [
                'id' => 6,
                'name' => 'Behringer X Air XR18',
                'description' => 'Mélangeur numérique 18 canaux',
                'reference' => 'XR18',
                'park_id' => null,
                'rental_price' => 49.99,
                'stock_quantity' => null,
                'out_of_order_quantity' => null,
                'replacement_price' => 419.0,
                'tags' => [],
                'attributes' => [
                    [
                        'id' => 5,
                        'name' => "Date d'achat",
                        'type' => "date",
                        'unit' => null,
                        'value' => '2021-01-28',
                    ],
                ],
            ],
            [
                'id' => 1,
                'name' => "Console Yamaha CL3",
                'description' => "Console numérique 64 entrées / 8 sorties + Master + Sub",
                'reference' => "CL3",
                'park_id' => 1,
                'rental_price' => 300.0,
                'stock_quantity' => 5,
                'out_of_order_quantity' => 1,
                'replacement_price' => 19400.0,
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
                'tags' => [
                    ['id' => 3, 'name' => 'pro']
                ],
            ],
        ], $results);
    }

    public function testCreateDuplicate(): void
    {
        // - Ajoute une sous-catégorie qui a le même nom qu'une autre, mais dans une
        // - catégorie différente
        $result = $this->model->edit(null, [
            'name'        => 'dimmers',
            'category_id' => 1
        ]);
        $this->assertNotNull($result->toArray());

        // - Tente d'ajouter une sous-catégorie qui existe déjà pour cette catégorie
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_DUPLICATE);
        $this->model->edit(null, [
            'name'        => 'dimmers',
            'category_id' => 2
        ]);
    }
}
