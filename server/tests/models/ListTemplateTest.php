<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\ListTemplate;

final class ListTemplateTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new ListTemplate();
    }

    public function testTableName(): void
    {
        $this->assertEquals('list_templates', $this->model->getTable());
    }

    public function testGetAll(): void
    {
        $result = $this->model->getAll()->forAll()->get();
        $this->assertEquals([
            [
                'id' => 2,
                'name' => 'Petit concert',
                'description' => null,
            ],
            [
                'id' => 1,
                'name' => 'Premier modèle',
                'description' => "Une liste de matériel bien sympa.",
            ],
        ], $result->toArray());
    }

    public function testGetParks(): void
    {
        // - ListTemplate non existant
        $result = ListTemplate::getParks(999);
        $this->assertEquals([], $result);

        // - ListTemplates avec du matériel d'un seul parc
        $result = ListTemplate::getParks(1);
        $this->assertEquals([1], $result);

        // - ListTemplate avec du matériel de deux parcs
        $result = ListTemplate::getParks(2);
        $this->assertEquals([2, 1], $result);
    }

    public function testGetMaterials(): void
    {
        // - Matériel sans unités
        $listTemplate = $this->model::find(1);
        $results = $listTemplate->materials;
        $this->assertCount(3, $results);

        $this->assertEquals('Showtec SDS-6', $results[0]['name']);
        $this->assertEquals(1, $results[0]['pivot']['quantity']);

        $this->assertEquals('Processeur DBX PA2', $results[1]['name']);
        $this->assertEquals(1, $results[1]['pivot']['quantity']);

        $this->assertEquals('Console Yamaha CL3', $results[2]['name']);
        $this->assertEquals(1, $results[2]['pivot']['quantity']);

        // - Matériel avec des unités
        $listTemplate = $this->model::find(2);
        $results = $listTemplate->materials;
        $this->assertCount(4, $results);

        $this->assertEquals('Volkswagen Transporter', $results[0]['name']);
        $this->assertEquals(1, $results[0]['pivot']['quantity']);
        $this->assertCount(1, $results[0]['units']);
        $this->assertEquals('VHCL-1', $results[0]['units'][0]['reference']);

        $this->assertEquals('Behringer X Air XR18', $results[1]['name']);
        $this->assertEquals(2, $results[1]['pivot']['quantity']);
        $this->assertCount(3, $results[1]['units']);
        $this->assertEquals('XR18-1', $results[1]['units'][0]['reference']);
        $this->assertEquals('XR18-2', $results[1]['units'][1]['reference']);
        $this->assertTrue($results[1]['units'][2]['is_broken']);
        $this->assertEquals('XR18-3', $results[1]['units'][2]['reference']);

        $this->assertEquals('Processeur DBX PA2', $results[2]['name']);
        $this->assertEquals(2, $results[2]['pivot']['quantity']);
        $this->assertCount(0, $results[2]['units']);

        $this->assertEquals('Console Yamaha CL3', $results[3]['name']);
        $this->assertEquals(3, $results[3]['pivot']['quantity']);
        $this->assertCount(0, $results[3]['units']);
    }

    public function testValidateName(): void
    {
        // - Validation passe
        $this->assertNotEmpty((new ListTemplate(['name' => 'Test name OK']))->validate());

        // - Validation ne passe pas : name ne doit pas être vide
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        (new ListTemplate(['name' => '']))->validate();
    }

    public function testStaticEdit()
    {
        $data = [
            'name' => 'Test update',
            'description' => '',
            'materials' => [
                ['id' => 3, 'quantity' => 20],
                ['id' => 2, 'quantity' => 3],
                ['id' => 5, 'quantity' => 14],
                ['id' => 1, 'quantity' => 8],
                ['id' => 6, 'quantity' => 2, 'units' => [1, 2]],
            ],
        ];

        $listTemplate = ListTemplate::staticEdit(2, $data);
        $this->assertEquals(2, $listTemplate->id);
        $this->assertEquals('Test update', $listTemplate->name);
        $this->assertNull($listTemplate->description);
        $this->assertEquals(5, count($listTemplate->materials));
        $this->assertEquals(5, $listTemplate->materials[0]['id']);
        $this->assertEquals(14, $listTemplate->materials[0]['pivot']['quantity']);
        $this->assertEquals(3, $listTemplate->materials[1]['id']);
        $this->assertEquals(20, $listTemplate->materials[1]['pivot']['quantity']);
        $this->assertEquals(6, $listTemplate->materials[2]['id']);
        $this->assertEquals(2, $listTemplate->materials[2]['pivot']['quantity']);
        $this->assertEquals(2, $listTemplate->materials[3]['id']);
        $this->assertEquals(3, $listTemplate->materials[3]['pivot']['quantity']);
        $this->assertEquals(1, $listTemplate->materials[4]['id']);
        $this->assertEquals(8, $listTemplate->materials[4]['pivot']['quantity']);
    }

    public function testSyncMaterials()
    {
        $materials = [
            [ 'id' => 2, 'quantity' => 4 ],
            [ 'id' => 1, 'quantity' => 7 ],
            [ 'id' => 6, 'quantity' => 2, 'units' => [1, 2] ],
        ];

        $listTemplate = ListTemplate::findOrFail(1);
        $listTemplate->syncMaterials($materials);
        $this->assertEquals(3, count($listTemplate->materials));
        $this->assertEquals(6, $listTemplate->materials[0]['id']);
        $this->assertEquals(2, $listTemplate->materials[0]['pivot']['quantity']);
        $this->assertCount(2, $listTemplate->materials[0]['pivot']['units']);
        $this->assertEquals(2, $listTemplate->materials[1]['id']);
        $this->assertEquals(4, $listTemplate->materials[1]['pivot']['quantity']);
        $this->assertEquals(1, $listTemplate->materials[2]['id']);
        $this->assertEquals(7, $listTemplate->materials[2]['pivot']['quantity']);
    }
}
