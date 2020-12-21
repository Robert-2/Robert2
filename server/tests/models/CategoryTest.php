<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models;

final class CategoryTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\Category();
    }

    public function testGetAll(): void
    {
        $result = $this->model->getAll()->get()->toArray();
        $this->assertCount(3, $result);
    }

    public function testGetSubCategories(): void
    {
        $Category = $this->model::find(2);
        $results  = $Category->sub_categories;
        $this->assertEquals([
            [
                'id'          => 4,
                'name'        => 'dimmers',
                'category_id' => 2,
            ],
            [
                'id'          => 3,
                'name'        => 'projectors',
                'category_id' => 2,
            ],
        ], $results);
    }

    public function testGetMaterials(): void
    {
        $Category = $this->model::find(2);
        $results = $Category->materials;
        $this->assertEquals([
            [
                'id'                     => 4,
                'name'                   => "Showtec SDS-6",
                'description'            => "Console DMX (jeu d'orgue) Showtec 6 canaux",
                'reference'              => "SDS-6-01",
                'park_id'                => 1,
                'rental_price'           => 15.95,
                'stock_quantity'         => 2,
                'out_of_order_quantity'  => null,
                'replacement_price'      => 59.0,
                'tags'                   => [],
                'attributes'             => [
                    [
                        'id'    => 4,
                        'name'  => 'Conforme',
                        'type'  => 'boolean',
                        'unit'  => null,
                        'value' => true,
                    ],
                    [
                        'id'    => 3,
                        'name'  => 'Puissance',
                        'type'  => 'integer',
                        'unit'  => 'W',
                        'value' => 60,
                    ],
                    [
                        'id'    => 1,
                        'name'  => 'Poids',
                        'type'  => 'float',
                        'unit'  => 'kg',
                        'value' => 3.15,
                    ],
                ],
            ],
            [
                'id'                     => 3,
                'name'                   => "PAR64 LED",
                'description'            => "Projecteur PAR64 à LED, avec son set de gélatines",
                'reference'              => "PAR64LED",
                'park_id'                => 1,
                'rental_price'           => 3.5,
                'stock_quantity'         => 34,
                'out_of_order_quantity'  => 4,
                'replacement_price'      => 89.0,
                'tags'                   => [
                    ['id' => 3, 'name' => 'pro']
                ],
                'attributes' => [
                    [
                        'id'    => 3,
                        'name'  => 'Puissance',
                        'type'  => 'integer',
                        'unit'  => 'W',
                        'value' => 150,
                    ],
                    [
                        'id'    => 1,
                        'name'  => 'Poids',
                        'type'  => 'float',
                        'unit'  => 'kg',
                        'value' => 0.85,
                    ],
                ],
            ],
        ], $results);
    }

    public function testGetIdsByNames(): void
    {
        $this->assertEmpty($this->model->getIdsByNames([]));

        $results = $this->model->getIdsByNames(['sound', 'light']);
        $this->assertEquals([2, 1], $results);
    }

    public function testBulkAdd(): void
    {
        $this->assertEmpty($this->model->bulkAdd([]));

        // - Ajout de deux catégories d'un seul coup
        $result = $this->model->bulkAdd([' one', ' dès ']);
        $this->assertCount(2, $result);
        $this->assertEquals('one', @$result[0]['name']);
        $this->assertEquals('dès', @$result[1]['name']);

        // - Ajout d'une catégorie, mais ignore la catégorie qui existe déjà
        $result = $this->model->bulkAdd(['new categ', 'sound']);
        $this->assertEquals('new categ', @$result[0]['name']);
        $this->assertEmpty(@$result[1]['name']);
    }
}
