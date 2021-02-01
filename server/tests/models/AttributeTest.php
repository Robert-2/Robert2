<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models;

final class AttributeTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\Attribute();
    }

    public function testTableName(): void
    {
        $this->assertEquals('attributes', $this->model->getTable());
    }

    public function testGetAll(): void
    {
        $result = $this->model->getAll()->get()->toArray();
        $this->assertCount(4, $result);
        $this->assertEquals([
            [
                'id' => 1,
                'name' => "Poids",
                'type' => "float",
                'unit' => "kg",
                'max_length' => null,
                'categories' => [
                    [
                        'id' => 2,
                        'name' => "light",
                        'sub_categories' => [
                            ['id' => 4, 'name' => 'dimmers', 'category_id' => 2],
                            ['id' => 3, 'name' => 'projectors', 'category_id' => 2],
                        ],
                        'pivot' => ['attribute_id' => 1, 'category_id' => 2]
                    ],
                    [
                        'id' => 1,
                        'name' => "sound",
                        'sub_categories' => [
                            ['id' => 1, 'name' => 'mixers', 'category_id' => 1],
                            ['id' => 2, 'name' => 'processors', 'category_id' => 1],
                        ],
                        'pivot' => ['attribute_id' => 1, 'category_id' => 1]
                    ],
                ],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 2,
                'name' => "Couleur",
                'type' => "string",
                'unit' => null,
                'max_length' => null,
                'categories' => [],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 3,
                'name' => "Puissance",
                'type' => "integer",
                'unit' => "W",
                'max_length' => null,
                'categories' => [
                    [
                        'id' => 1,
                        'name' => "sound",
                        'sub_categories' => [
                            ['id' => 1, 'name' => 'mixers', 'category_id' => 1],
                            ['id' => 2, 'name' => 'processors', 'category_id' => 1],
                        ],
                        'pivot' => ['attribute_id' => 3, 'category_id' => 1]
                    ],
                ],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 4,
                'name' => "Conforme",
                'type' => "boolean",
                'unit' => null,
                'max_length' => null,
                'categories' => [],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
        ], $result);
    }

    public function testGetMaterials(): void
    {
        $Event = $this->model::find(4);
        $results = $Event->materials;
        $expected = [
            [
                'id' => 4,
                'name' => 'Showtec SDS-6',
                'tags' => [],
                'units' => [],
                'attributes' => [
                    [
                        'id' => 4,
                        'name' => 'Conforme',
                        'type' => 'boolean',
                        'unit' => null,
                        'value' => true,
                    ],
                    [
                        'id' => 3,
                        'name' => 'Puissance',
                        'type' => 'integer',
                        'unit' => 'W',
                        'value' => 60,
                    ],
                    [
                        'id' => 1,
                        'name' => 'Poids',
                        'type' => 'float',
                        'unit' => 'kg',
                        'value' => 3.15,
                    ],
                ],
                'pivot' => [
                    'attribute_id' => 4,
                    'material_id' => 4,
                    'value' => 'true',
                ],
            ],
        ];
        $this->assertEquals($expected, $results);
    }
}
