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
                'categories' => [],
            ],
            [
                'id' => 2,
                'name' => "Couleur",
                'type' => "string",
                'maxLength' => null,
                'categories' => [],
            ],
            [
                'id' => 5,
                'name' => "Date d'achat",
                'type' => "date",
                'categories' => [],
            ],
            [
                'id' => 1,
                'name' => "Poids",
                'type' => "float",
                'unit' => "kg",
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
            ],
            [
                'id' => 3,
                'name' => "Puissance",
                'type' => "integer",
                'unit' => "W",
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
                'categories' => [],
            ],
            [
                'id' => 2,
                'name' => "Couleur",
                'type' => "string",
                'maxLength' => null,
                'categories' => [],
            ],
            [
                'id' => 5,
                'name' => "Date d'achat",
                'type' => "date",
                'categories' => [],
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
                'categories' => [],
            ],
            [
                'id' => 2,
                'name' => "Couleur",
                'type' => "string",
                'maxLength' => null,
                'categories' => [],
            ],
            [
                'id' => 5,
                'name' => "Date d'achat",
                'type' => "date",
                'categories' => [],
            ],
            [
                'id' => 1,
                'name' => "Poids",
                'type' => "float",
                'unit' => "kg",
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
            'categories' => [2, 3],
        ];
        $this->client->post('/api/attributes', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $expected = [
            'id' => 6,
            'name' => 'Speed',
            'type' => 'float',
            'unit' => 'km/h',
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
        ];
        $this->assertResponseData($expected);
    }

    public function testUpdateAttribute()
    {
        // - Modifie une caractéristique spéciale
        $data = [
            'name' => 'Masse',
            'type' => 'integer',
            'unit' => 'g',
        ];
        $this->client->put('/api/attributes/1', $data);
        $this->assertStatusCode(SUCCESS_OK);
        // - Uniquement le nom a été modifié
        $expected = [
            'id' => 1,
            'name' => 'Masse',
            'type' => 'float',
            'unit' => 'kg',
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
        ];
        $this->assertResponseData($expected);
    }
}
