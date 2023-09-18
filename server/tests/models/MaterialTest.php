<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Illuminate\Support\Carbon;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\Event;
use Loxya\Models\Material;
use Loxya\Support\Period;

final class MaterialTest extends TestCase
{
    public function testValidation(): void
    {
        $data = [
            'name' => 'A',
            'reference' => 'ref-Te$t',
            'picture' => 'pic',
            'park_id' => 1,
            'category_id' => 1,
            'sub_category_id' => 2,
            'rental_price' => -2.5,
            'stock_quantity' => 120_000,
            'out_of_order_quantity' => 110_000,
            'replacement_price' => -10,
        ];

        $errors = null;
        try {
            (new Material($data))->validate();
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
        }

        $expectedErrors = [
            'name' => ["2 caractères min., 191 caractères max."],
            'reference' => ["Ce champ contient des caractères non autorisés"],
            'picture' => ["5 caractères min., 227 caractères max."],
            'rental_price' => ["Doit être supérieur ou égal à 0"],
            'stock_quantity' => ["Doit être inférieur ou égal à 100000"],
            'out_of_order_quantity' => ["Doit être inférieur ou égal à 100000"],
            'replacement_price' => ["Doit être supérieur ou égal à 0"],
        ];
        $this->assertEquals($expectedErrors, $errors);
    }

    public function testAllWithAvailabilities(): void
    {
        $originalMaterials =  Material::orderBy('id', 'asc')->get();

        // - Calcul des quantités restantes de chaque matériel sans spécifier de date (aucun événement)
        $materials = Material::allWithAvailabilities($originalMaterials);
        $this->assertCount(8, $materials);
        $this->assertEquals([4, 2, 30, 2, 32, 2, 2, 2], $materials->pluck('available_quantity')->all());

        // - Calcul des quantités restantes de chaque matériel pour une période sans événement
        $materials = Material::allWithAvailabilities($originalMaterials, new Period('2018-12-01', '2018-12-02'));
        $this->assertCount(8, $materials);
        $this->assertEquals([4, 2, 30, 2, 32, 2, 2, 2], $materials->pluck('available_quantity')->all());

        // - Calcul des quantités restantes de chaque matériel pour une période avec trois événements
        $materials = Material::allWithAvailabilities($originalMaterials, new Period('2018-12-15', '2018-12-20'));
        $this->assertCount(8, $materials);
        $this->assertEquals([0, 0, 20, 1, 20, 2, 2, 2], $materials->pluck('available_quantity')->all());

        // - Calcul des quantités restantes de chaque matériel pour une période avec un seul événement
        $materials = Material::allWithAvailabilities($originalMaterials, new Period('2018-12-19', '2018-12-20'));
        $this->assertCount(8, $materials);
        $this->assertEquals([1, 0, 30, 2, 32, 2, 2, 2], $materials->pluck('available_quantity')->all());

        // - Calcul des quantités restantes de chaque matériel pendant l'événement 1 (en l'excluant).
        $materials = Material::allWithAvailabilities($originalMaterials, Event::find(1));
        $this->assertCount(8, $materials);
        $this->assertEquals([1, 0, 30, 2, 32, 2, 2, 2], $materials->pluck('available_quantity')->all());
    }

    public function testSearch(): void
    {
        // - Search a material name
        $results = Material::search('console')->get();
        $this->assertCount(1, $results);
        $this->assertEquals(
            ['Console Yamaha CL3'],
            $results->pluck('name')->all()
        );

        // - Search a material reference
        $results = Material::search('PA')->get();
        $this->assertCount(2, $results);
        $this->assertEquals(
            ['DBXPA2', 'PAR64LED'],
            $results->pluck('reference')->all()
        );
    }

    public function testCreateMaterialWithoutData(): void
    {
        $this->expectException(ValidationException::class);
        Material::new([]);
    }

    public function testCreateMaterialBadData(): void
    {
        $this->expectException(ValidationException::class);
        Material::new(['foo' => 'bar']);
    }

    public function testCreateMaterialDuplicate(): void
    {
        $this->expectException(ValidationException::class);
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
        Carbon::setTestNow(Carbon::create(2019, 02, 24, 23, 59, 00));

        $expected = [
            'id' => 9,
            'name' => 'Analog Mixing Console Yamaha RM800',
            'description' => null,
            'reference' => 'RM800',
            'is_unitary' => false,
            'park_id' => 1,
            'park_location_id' => null,
            'category_id' => 1,
            'sub_category_id' => null,
            'out_of_order_quantity' => null,
            'rental_price' => 100.0,
            'replacement_price' => 100.6,
            'stock_quantity' => 1,
            'is_hidden_on_bill' => false,
            'is_discountable' => true,
            'is_reservable' => true,
            'picture' => null,
            'note' => null,
            'tags' => [],
            'attributes' => [],
            'created_at' => '2019-02-24 23:59:00',
            'updated_at' => '2019-02-24 23:59:00',
            'deleted_at' => null,
        ];
        $material = Material::new([
            'name' => 'Analog Mixing Console Yamaha RM800',
            'reference' => 'RM800',
            'park_id' => 1,
            'category_id' => 1,
            'rental_price' => '100.0',
            'replacement_price' => '100.6',
            'stock_quantity' => 1,
        ]);
        $this->assertEquals($expected, $material->attributesToArray());
    }
}
