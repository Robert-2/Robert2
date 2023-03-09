<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models\Event;
use Robert2\API\Models\Material;
use Robert2\Support\Collections\MaterialsCollection;

final class MaterialsCollectionTest extends TestCase
{
    public function testByCategoriesMaterials()
    {
        $materials = (new Material())->getAll()->get();

        $collection = new MaterialsCollection($materials);
        $result = $collection->byCategories();

        $expected = [
            'Décors' => ['Décor Thème Forêt'],
            'Lumière' => ['PAR64 LED', 'Showtec SDS-6'],
            'Son' => [
                'Behringer X Air XR18',
                'Câble XLR 10m',
                'Console Yamaha CL3',
                'Processeur DBX PA2',
            ],
            'Transport' => ['Volkswagen Transporter'],
        ];
        $this->assertSame(array_keys($expected), $result->keys()->all());

        foreach ($expected as $key => $expectedNames) {
            $names = $result->get($key)->pluck('name')->all();
            $this->assertSame($expectedNames, $names);
        }
    }

    public function testByCategoriesEventMaterials()
    {
        $event = Event::findOrFail(1);
        $materials = $event->materials;

        $collection = new MaterialsCollection($materials);
        $result = $collection->byCategories();

        $expected = [
            'Lumière' => ['Showtec SDS-6'],
            'Son' => ['Console Yamaha CL3', 'Processeur DBX PA2'],
        ];
        $this->assertSame(array_keys($expected), $result->keys()->all());

        foreach ($expected as $key => $expectedNames) {
            $names = $result->get($key)->pluck('name')->all();
            $this->assertSame($expectedNames, $names);
        }
    }

    public function testBySubCategoriesMaterials()
    {
        $materials = (new Material())->getAll()->get();

        $collection = new MaterialsCollection($materials);
        $result = $collection->bySubCategories();

        $expected = [
            'Décors - __other' => ['Décor Thème Forêt'],
            'Lumière - Gradateurs' => ['Showtec SDS-6'],
            'Lumière - Projecteurs' => ['PAR64 LED'],
            'Son - Mixeurs' => ['Behringer X Air XR18', 'Console Yamaha CL3'],
            'Son - Processeurs' => ['Processeur DBX PA2'],
            'Son - __other' => ['Câble XLR 10m'],
            'Transport - __other' => ['Volkswagen Transporter'],
        ];
        $this->assertSame(array_keys($expected), $result->keys()->all());

        foreach ($expected as $key => $expectedNames) {
            $names = $result->get($key)->pluck('name')->all();
            $this->assertSame($expectedNames, $names);
        }
    }

    public function testBySubCategoriesEventMaterials()
    {
        $event = Event::findOrFail(1);
        $materials = $event->materials;

        $collection = new MaterialsCollection($materials);
        $result = $collection->bySubCategories();

        $expected = [
            'Lumière - Gradateurs' => ['Showtec SDS-6'],
            'Son - Mixeurs' => ['Console Yamaha CL3'],
            'Son - Processeurs' => ['Processeur DBX PA2'],
        ];
        $this->assertSame(array_keys($expected), $result->keys()->all());

        foreach ($expected as $key => $expectedNames) {
            $names = $result->get($key)->pluck('name')->all();
            $this->assertSame($expectedNames, $names);
        }
    }

    public function testByParksMaterials()
    {
        $materials = (new Material())->getAll()->get();

        $collection = new MaterialsCollection($materials);
        $result = $collection->byParks();

        $expected = [
            'default' => [
                'Behringer X Air XR18',
                'Câble XLR 10m',
                'Console Yamaha CL3',
                'PAR64 LED',
                'Processeur DBX PA2',
                'Showtec SDS-6',
            ],
            'spare' => [
                'Décor Thème Forêt',
                'Volkswagen Transporter',
            ],
        ];
        $this->assertSame(array_keys($expected), $result->keys()->all());

        foreach ($expected as $parkName => $expectedNames) {
            $names = $result->get($parkName)->pluck('name')->all();
            $this->assertSame($expectedNames, $names);
        }
    }

    public function testByParksEventMaterials()
    {
        $event = Event::findOrFail(1);
        $materials = $event->materials;

        $collection = new MaterialsCollection($materials);
        $result = $collection->byParks();

        $expected = [
            'default' => [
                'Console Yamaha CL3',
                'Processeur DBX PA2',
                'Showtec SDS-6',
            ],
        ];
        $this->assertSame(array_keys($expected), $result->keys()->all());

        foreach ($expected as $key => $expectedNames) {
            $names = $result->get($key)->pluck('name')->all();
            $this->assertSame($expectedNames, $names);
        }
    }
}
