<?php
namespace Robert2\Tests;

final class AttributesTest extends ApiTestCase
{
    public function testGetAll()
    {
        // - Récupère toutes les caractéristiques spéciales avec leurs catégories
        $this->client->get('/api/attributes');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $expected = [
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
                'id' => 5,
                'name' => "Date d'achat",
                'type' => "date",
                'unit' => null,
                'max_length' => null,
                'categories' => [],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
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
        ];
        $this->assertEquals($expected, $response);
    }

    public function testGetAllForCategory()
    {
        // - Récupère les caractéristiques spéciales qui n'ont
        // - pas de catégorie, + celles de la catégorie #3
        $this->client->get('/api/attributes?category=3');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $expected = [
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
                'id' => 5,
                'name' => "Date d'achat",
                'type' => "date",
                'unit' => null,
                'max_length' => null,
                'categories' => [],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
        ];
        $this->assertEquals($expected, $response);

        // - Récupère les caractéristiques spéciales qui n'ont
        // - pas de catégorie, + celles de la catégorie #2
        $this->client->get('/api/attributes?category=2');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $expected = [
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
                'id' => 5,
                'name' => "Date d'achat",
                'type' => "date",
                'unit' => null,
                'max_length' => null,
                'categories' => [],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
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
        ];
        $this->assertEquals($expected, $response);
    }

    public function testCreateAttribute()
    {
        // Crée une nouvelle caractéristique spéciale
        $data = [
            'name' => 'Speed',
            'type' => 'float',
            'unit' => 'km/h',
            'max_length' => 4,
            'categories' => [2, 3],
        ];
        $this->client->post('/api/attributes', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $expected = [
            'id' => 6,
            'name' => 'Speed',
            'type' => 'float',
            'unit' => 'km/h',
            'max_length' => 4,
            'categories' => [
                [
                    'id' => 2,
                    'name' => "light",
                    'sub_categories' => [
                        ['id' => 4, 'name' => 'dimmers', 'category_id' => 2],
                        ['id' => 3, 'name' => 'projectors', 'category_id' => 2],
                    ],
                    'pivot' => ['attribute_id' => 6, 'category_id' => 2]
                ],
                [
                    'id' => 3,
                    'name' => "transport",
                    'sub_categories' => [],
                    'pivot' => ['attribute_id' => 6, 'category_id' => 3]
                ],
            ],
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
            'deleted_at' => null,
        ];
        $this->assertResponseData($expected, ['created_at', 'updated_at']);
    }

    public function testUpdateAttribute()
    {
        // - Modifie une caractéristique spéciale
        $data = [
            'name' => 'Masse',
            'type' => 'integer',
            'unit' => 'g',
            'max_length' => 10,
        ];
        $this->client->put('/api/attributes/1', $data);
        $this->assertStatusCode(SUCCESS_OK);
        // - Uniquement le nom a été modifié
        $expected = [
            'id' => 1,
            'name' => 'Masse',
            'type' => 'float',
            'unit' => 'kg',
            'max_length' => null,
            'created_at' => null,
            'updated_at' => 'fakedTestContent',
            'deleted_at' => null,
        ];
        $this->assertResponseData($expected, ['updated_at']);
    }
}
