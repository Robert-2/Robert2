<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Material;

final class MaterialTest extends TestCase
{
    public function testGetAllFiltered(): void
    {
        // - Récupération du matériel associé au parc n°1
        $result = (new Material)->getAllFiltered(['park_id' => 1])->get();
        $this->assertCount(6, $result);

        // - Récupération du matériel associé au parc n°2
        $result = (new Material)->getAllFiltered(['park_id' => 2])->get();
        $this->assertCount(2, $result);

        // - Récupération du matériel associé à la catégorie n°1
        $result = (new Material)->getAllFiltered(['category_id' => 1])->get();
        $this->assertCount(4, $result);

        // - Récupération du matériel associé à la catégorie n°1 et à la sous-catégorie n°1
        $result = (new Material)
            ->getAllFiltered(['category_id' => 1, 'sub_category_id' => 1])
            ->get();
        $this->assertCount(2, $result);

        // - Récupération du matériel associé à la catégorie n°1 avec le nom "console"
        $result = (new Material)
            ->setSearch('console')
            ->getAllFiltered(['category_id' => 1])
            ->get();
        $this->assertCount(1, $result);
    }

    public function testGetAllFilteredOrTagged(): void
    {
        // - Récupération du matériel associées au tag "pro"
        $result = (new Material)->getAllFilteredOrTagged([], ['pro'])->get();
        $this->assertCount(3, $result);

        $result = (new Material)->getAllFilteredOrTagged(['category_id' => 1], ['pro'])->get();
        $this->assertCount(2, $result);
    }

    public function testWithAvailabilities(): void
    {
        $originalMaterials =  Material::orderBy('id', 'asc')->get();

        // - Calcul des quantités restantes de chaque matériel sans spécifier de date (aucun événement)
        $materials = Material::withAvailabilities($originalMaterials);
        $this->assertCount(8, $materials);
        $this->assertEquals([4, 2, 30, 2, 32, 0, 1, 1], $materials->pluck('available_quantity')->all());

        // - Calcul des quantités restantes de chaque matériel pour une période sans événement
        $materials = Material::withAvailabilities($originalMaterials, '2018-12-01', '2018-12-02');
        $this->assertCount(8, $materials);
        $this->assertEquals([4, 2, 30, 2, 32, 0, 1, 1], $materials->pluck('available_quantity')->all());

        // - Calcul des quantités restantes de chaque matériel pour une période avec trois événements
        $materials = Material::withAvailabilities($originalMaterials, '2018-12-15', '2018-12-20');
        $this->assertCount(8, $materials);
        $this->assertEquals([0, 0, 20, 1, 20, 0, 1, 1], $materials->pluck('available_quantity')->all());

        // - Calcul des quantités restantes de chaque matériel pour une période avec un seul événement
        $materials = Material::withAvailabilities($originalMaterials, '2018-12-19', '2018-12-20');
        $this->assertCount(8, $materials);
        $this->assertEquals([1, 0, 30, 2, 32, 0, 1, 1], $materials->pluck('available_quantity')->all());

        // - Calcul des quantités restantes de chaque matériel pour une période avec trois événements
        // - en excluant l'événement n°2
        $materials = Material::withAvailabilities($originalMaterials, '2018-12-15', '2018-12-20', 2);
        $this->assertCount(8, $materials);
        $this->assertEquals([3, 1, 20, 1, 20, 0, 1, 1], $materials->pluck('available_quantity')->all());
    }

    public function testSetSearch(): void
    {
        // - Empty search
        $results = (new Material)->setSearch()->getAll()->get();
        $this->assertCount(8, $results);

        // - Search a material name
        $results = (new Material)->setSearch('console')->getAll()->get();
        $this->assertCount(1, $results);
        $this->assertEquals(
            ['Console Yamaha CL3'],
            $results->pluck('name')->all()
        );

        // - Search a material reference
        $results = (new Material)->setSearch('PA', 'reference')->getAll()->get();
        $this->assertCount(2, $results);
        $this->assertEquals(
            ['PAR64LED', 'DBXPA2'],
            $results->pluck('reference')->all()
        );

        // - Search with not allowed field
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Search field \"rental_price\" not allowed.");
        (new Material)->setSearch('Console', 'rental_price');
    }

    public function testSetTags(): void
    {
        // - Empty tags
        foreach ([null, []] as $emptyValue) {
            $material = Material::find(1)->setTags($emptyValue);
            $this->assertTrue($material->tags->isEmpty());
        }

        // - Set tags : one existing, and two new tags
        $material = Material::find(1)->setTags(['Technician', 'yipee', 'new tag']);
        $this->assertEquals([2, 3, 4], $material->tags->pluck('id')->all());
    }

    public function testCreateMaterialWithoutData(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Material::new([]);
    }

    public function testCreateMaterialBadData(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Material::new(['foo' => 'bar']);
    }

    public function testCreateMaterialDuplicate(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Material::new([
            'name' => 'Test duplicate ref. CL3',
            'reference' => 'CL3',
            'park_id' => 1,
            'category_id' => 1,
            'rental_price' => 155,
            'stock_quantity' => 10,
        ]);
    }

    public function testCreateMaterial(): void
    {
        // - Test d'ajout de matériel, avec tags
        $result = Material::new([
            'name' => 'Analog Mixing Console Yamaha RM800',
            'reference' => 'RM800',
            'park_id' => 1,
            'category_id' => 1,
            'rental_price' => '100.0',
            'replacement_price' => '100.6',
            'stock_quantity' => 1,
            'tags' => ['old matos', 'vintage'],
        ]);
        $expected = [
            'id' => 9,
            'name' => 'Analog Mixing Console Yamaha RM800',
            'description' => null,
            'reference' => 'RM800',
            'is_unitary' => false,
            'park_id' => 1,
            'category_id' => 1,
            'sub_category_id' => null,
            'out_of_order_quantity' => null,
            'rental_price' => 100.0,
            'replacement_price' => 100.6,
            'stock_quantity' => 1,
            'is_hidden_on_bill' => false,
            'is_discountable' => true,
            'picture' => null,
            'note' => null,
        ];

        $arrayResult = $result->setAppends([])->attributesToArray();
        unset(
            $arrayResult['created_at'],
            $arrayResult['updated_at'],
            $arrayResult['deleted_at']
        );

        $this->assertEquals($expected, $arrayResult);
        $this->assertEquals([2, 3], $result->tags->pluck('id')->all());
    }
}
