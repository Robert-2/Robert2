<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Errors;
use Robert2\API\Models;

final class MaterialTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\Material();
    }

    public function testTableName(): void
    {
        $this->assertEquals('materials', $this->model->getTable());
    }

    public function testGetAll(): void
    {
        $result = $this->model->getAll()->get()->toArray();
        $this->assertCount(8, $result);
    }

    public function testGetAllFiltered(): void
    {
        // - Récupération du matériel associé au parc n°1
        $options = ['park_id' => 1];
        $result = $this->model->getAllFiltered($options)->get()->toArray();
        $this->assertCount(5, $result);

        // - Récupération du matériel associé à la catégorie n°1
        $options = ['category_id' => 1];
        $result = $this->model->getAllFiltered($options)->get()->toArray();
        $this->assertCount(4, $result);

        // - Récupération du matériel associé à la catégorie n°1 et à la sous-catégorie n°1
        $options = ['category_id' => 1, 'sub_category_id' => 1];
        $result = $this->model->getAllFiltered($options)->get()->toArray();
        $this->assertCount(2, $result);

        // - Récupération du matériel associé à la catégorie n°1 avec le nom "console"
        $options = ['category_id' => 1];
        $this->model->setSearch('console');
        $result = $this->model->getAllFiltered($options)->get()->toArray();
        $this->assertCount(1, $result);
    }

    public function testGetAllFilteredOrTagged(): void
    {
        // - Récupération du matériel associées au tag "pro"
        $tags = ['pro'];
        $result = $this->model->getAllFilteredOrTagged([], $tags)->get()->toArray();
        $this->assertCount(3, $result);

        $options = ['category_id' => 1];
        $result = $this->model->getAllFilteredOrTagged($options, $tags)->get()->toArray();
        $this->assertCount(2, $result);
    }

    public function testRecalcQuantitiesForPeriod(): void
    {
        $getData = function () {
            $builder = $this->model->getAll();
            $builder->getQuery()->orders = null;
            return $builder->orderBy('id', 'asc')->get()->toArray();
        };

        // - Calcul des quantités restantes de chaque matériel pour une période sans événement
        $data = $getData();
        $result = $this->model->recalcQuantitiesForPeriod($data, '2018-12-01', '2018-12-02');
        $this->assertCount(8, $result);
        foreach ([4, 2, 30, 2, 32, 2, 1, 2] as $index => $expected) {
            $this->assertEquals($expected, $result[$index]['remaining_quantity']);
        }

        // - Calcul des quantités restantes de chaque matériel pour une période avec trois événements
        $data = $getData();
        $result = $this->model->recalcQuantitiesForPeriod($data, '2018-12-15', '2018-12-20');
        $this->assertCount(8, $result);
        foreach ([0, 0, 20, 1, 20, 2, 1, 2] as $index => $expected) {
            $this->assertEquals($expected, $result[$index]['remaining_quantity']);
        }

        // - Calcul des quantités restantes de chaque matériel pour une période avec un seul événement
        $data = $getData();
        $result = $this->model->recalcQuantitiesForPeriod($data, '2018-12-19', '2018-12-20');
        $this->assertCount(8, $result);
        foreach ([1, 0, 30, 2, 32, 2, 1, 2] as $index => $expected) {
            $this->assertEquals($expected, $result[$index]['remaining_quantity']);
        }

        // - Calcul des quantités restantes de chaque matériel pour une période avec trois événements
        // - en excluant l'événement n°2
        $data = $getData();
        $result = $this->model->recalcQuantitiesForPeriod($data, '2018-12-15', '2018-12-20', 2);
        $this->assertCount(8, $result);
        foreach ([3, 1, 20, 1, 20, 2, 1, 2] as $index => $expected) {
            $this->assertEquals($expected, $result[$index]['remaining_quantity']);
        }
    }

    public function testSetSearch(): void
    {
        // - Empty search
        $this->model->setSearch();
        $results = $this->model->getAll()->get()->toArray();
        $this->assertCount(8, $results);

        // - Search a material name
        $this->model->setSearch('console');
        $results = $this->model->getAll()->get()->toArray();
        $this->assertCount(1, $results);
        $this->assertEquals('Console Yamaha CL3', $results[0]['name']);

        // - Search a material reference
        $this->model->setSearch('PA', 'reference');
        $results = $this->model->getAll()->get()->toArray();
        $this->assertCount(2, $results);
        $this->assertEquals('PAR64LED', $results[0]['reference']);
        $this->assertEquals('DBXPA2', $results[1]['reference']);

        // - Search with not allowed field
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Search field « rental_price » not allowed.");
        $this->model->setSearch('Console', 'rental_price');
    }

    public function testGetPark(): void
    {
        $Material = $this->model::find(1);
        $result   = $Material->park;
        $this->assertEquals([
            'id' => 1,
            'name' => "default",
            'total_items' => 5,
            'total_amount' => 101223.80,
            'total_stock_quantity' => 83,
        ], $result);
    }

    public function testGetCategory(): void
    {
        $Material = $this->model::find(1);
        $result   = $Material->category;
        $this->assertEquals([
            'id'   => 1,
            'name' => 'sound',
        ], $result);
    }

    public function testSubGetCategory(): void
    {
        $Material = $this->model::find(1);
        $result   = $Material->sub_category;
        $this->assertEquals([
            'id'          => 1,
            'name'        => 'mixers',
            'category_id' => 1,
        ], $result);
    }

    public function testGetTags(): void
    {
        $Material = $this->model::find(1);
        $expected = [
            ['id' => 3, 'name' => 'pro'],
        ];
        $this->assertEquals($expected, $Material->tags);
    }

    public function testGetAttributes(): void
    {
        $Material = $this->model::find(1);
        $results = $Material->Attributes;
        $this->assertCount(3, $results);
        $expected = [
            [
                'id'    => 3,
                'name'  => 'Puissance',
                'type'  => 'integer',
                'unit'  => 'W',
                'value' => 850,
            ],
            [
                'id'    => 2,
                'name'  => 'Couleur',
                'type'  => 'string',
                'unit'  => null,
                'value' => 'Grise',
            ],
            [
                'id'    => 1,
                'name'  => 'Poids',
                'type'  => 'float',
                'unit'  => 'kg',
                'value' => 36.5,
            ],
        ];
        $this->assertSame($expected, $results);
    }

    public function testGetEvents(): void
    {
        $Material = $this->model::find(1);
        $results = $Material->Events;
        $this->assertCount(3, $results);
        $this->assertEquals([
            'id'           => 2,
            'title'        => 'Second événement',
            'start_date'   => '2018-12-18 00:00:00',
            'end_date'     => '2018-12-19 23:59:59',
            'is_confirmed' => false,
            'pivot'        => [
                'id'          => 4,
                'material_id' => 1,
                'event_id'    => 2,
                'quantity'    => 3
            ],
        ], $results[1]);
        $this->assertEquals([
            'id'           => 1,
            'title'        => 'Premier événement',
            'start_date'   => '2018-12-17 00:00:00',
            'end_date'     => '2018-12-18 23:59:59',
            'is_confirmed' => false,
            'pivot'        => [
                'id'          => 1,
                'material_id' => 1,
                'event_id'    => 1,
                'quantity'    => 1
            ],
        ], $results[2]);
    }

    public function testSetTagsNoData(): void
    {
        $result = $this->model->setTags(1, null);
        $this->assertEmpty($result);

        $result = $this->model->setTags(1, []);
        $this->assertEmpty($result);
    }

    public function testSetTagsNotFound(): void
    {
        $this->expectException(Errors\NotFoundException::class);
        $this->model->setTags(999, ['notFoundTag']);
    }

    public function testSetTags(): void
    {
        // - Empty tags
        $result = $this->model->setTags(1, []);
        $expected = [];
        $this->assertEquals($expected, $result);

        // - Set tags : one existing, and two new tags
        $result = $this->model->setTags(1, ['tag 01', 'yipee', 'new tag']);
        $expected = [
            ['id' => 1, 'name' => 'tag 01'],
            ['id' => 4, 'name' => 'yipee'],
            ['id' => 5, 'name' => 'new tag'],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testCreateMaterialWithoutData(): void
    {
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $this->model->edit(null, []);
    }

    public function testCreateMaterialBadData(): void
    {
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $this->model->edit(null, ['foo' => 'bar']);
    }

    public function testCreateMaterialDuplicate(): void
    {
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_DUPLICATE);
        $this->model->edit(null, [
            'name'           => 'Test duplicate ref. CL3',
            'reference'      => 'CL3',
            'park_id'        => 1,
            'category_id'    => 1,
            'rental_price'   => 155,
            'stock_quantity' => 10,
        ]);
    }

    public function testCreateMaterial(): void
    {
        // - Test d'ajout de matériel, avec tags
        $result = $this->model->edit(null, [
            'name'              => 'Analog Mixing Console Yamaha RM800',
            'reference'         => 'RM800',
            'park_id'           => 1,
            'category_id'       => 1,
            'rental_price'      => '100.0',
            'replacement_price' => '100.6',
            'stock_quantity'    => 1,
            'tags'              => ['old matos', 'vintage'],
        ]);
        $expected = [
            'id'                    => 9,
            'name'                  => 'Analog Mixing Console Yamaha RM800',
            'description'           => null,
            'reference'             => 'RM800',
            'is_unitary'            => false,
            'park_id'               => 1,
            'category_id'           => 1,
            'sub_category_id'       => null,
            'out_of_order_quantity' => null,
            'rental_price'          => 100.0,
            'replacement_price'     => 100.6,
            'stock_quantity'        => 1,
            'is_hidden_on_bill'     => false,
            'is_discountable'       => true,
            'note'                  => null,
            'tags'                  => [
                ['id' => 4, 'name' => 'old matos'],
                ['id' => 5, 'name' => 'vintage'],
            ],
            'attributes' => [],
            'units'      => [],
        ];
        unset($result->created_at, $result->updated_at, $result->deleted_at);
        $this->assertEquals($expected, $result->toArray());
    }
}
