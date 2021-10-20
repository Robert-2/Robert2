<?php
namespace Robert2\Tests;

final class ListTemplatesTest extends ApiTestCase
{
    public function testGetListTemplates()
    {
        $this->client->get('/api/list-templates');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'pagination' => [
                'current_page' => 1,
                'from' => 1,
                'last_page' => 1,
                'path' => '/api/list-templates',
                'first_page_url' => '/api/list-templates?page=1',
                'next_page_url' => null,
                'prev_page_url' => null,
                'last_page_url' => '/api/list-templates?page=1',
                'per_page' => $this->settings['maxItemsPerPage'],
                'to' => 2,
                'total' => 2,
            ],
            'data' => [
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
            ],
        ]);

        // - Test sans pagination
        $this->client->get('/api/list-templates?paginated=0');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
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
        ]);
    }

    public function testGetOneListTemplate()
    {
        $this->client->get('/api/list-templates/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'name' => 'Premier modèle',
            'description' => "Une liste de matériel bien sympa.",
            'materials' => [
                [
                    'id' => 4,
                    'name' => 'Showtec SDS-6',
                    'reference' => 'SDS-6-01',
                    'is_unitary' => false,
                    'park_id' => 1,
                    'category_id' => 2,
                    'sub_category_id' => 4,
                    'rental_price' => 15.95,
                    'stock_quantity' => 2,
                    'out_of_order_quantity' => null,
                    'replacement_price' => 59,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => true,
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
                        'list_template_id' => 1,
                        'material_id' => 4,
                        'id' => 3,
                        'quantity' => 1,
                        'units' => [],
                    ],
                ],
                [
                    'id' => 2,
                    'name' => 'Processeur DBX PA2',
                    'reference' => 'DBXPA2',
                    'is_unitary' => false,
                    'park_id' => 1,
                    'category_id' => 1,
                    'sub_category_id' => 2,
                    'rental_price' => 25.5,
                    'stock_quantity' => 2,
                    'out_of_order_quantity' => null,
                    'replacement_price' => 349.9,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => true,
                    'tags' => [
                        ['id' => 3, 'name' => 'pro'],
                    ],
                    'units' => [],
                    'attributes' => [
                        [
                            'id' => 3,
                            'name' => 'Puissance',
                            'type' => 'integer',
                            'unit' => 'W',
                            'value' => 35,
                        ],
                        [
                            'id' => 1,
                            'name' => 'Poids',
                            'type' => 'float',
                            'unit' => 'kg',
                            'value' => 2.2,
                        ],
                    ],
                    'pivot' => [
                        'list_template_id' => 1,
                        'material_id' => 2,
                        'id' => 2,
                        'quantity' => 1,
                        'units' => [],
                    ],
                ],
                [
                    'id' => 1,
                    'name' => 'Console Yamaha CL3',
                    'reference' => 'CL3',
                    'is_unitary' => false,
                    'park_id' => 1,
                    'category_id' => 1,
                    'sub_category_id' => 1,
                    'rental_price' => 300,
                    'stock_quantity' => 5,
                    'out_of_order_quantity' => 1,
                    'replacement_price' => 19400,
                    'is_hidden_on_bill' => false,
                    'is_discountable' => false,
                    'tags' => [
                        ['id' => 3, 'name' => 'pro'],
                    ],
                    'units' => [],
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
                    'pivot' => [
                        'list_template_id' => 1,
                        'material_id' => 1,
                        'id' => 1,
                        'quantity' => 1,
                        'units' => [],
                    ],
                ],
            ],
        ]);
    }

    public function testCreateListTemplate()
    {
        $data = [
            'name' => 'Nouvelle liste',
            'description' => 'Création de liste pour le test',
            'materials' => [
                ['id' => 2, 'quantity' => 5],
                ['id' => 3, 'quantity' => 2],
                ['id' => 5, 'quantity' => 12],
                ['id' => 6, 'quantity' => 2, 'units' => [1, 2]],
            ],
        ];
        $this->client->post('/api/list-templates', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(3, $response['id']);
        $this->assertEquals('Nouvelle liste', $response['name']);
        $this->assertEquals('Création de liste pour le test', $response['description']);
        $this->assertCount(4, $response['materials']);
        $this->assertEquals(6, $response['materials'][0]['id']);
        $this->assertEquals(2, $response['materials'][0]['pivot']['quantity']);
        $this->assertCount(2, $response['materials'][0]['pivot']['units']);
        $this->assertEquals(5, $response['materials'][1]['id']);
        $this->assertEquals(12, $response['materials'][1]['pivot']['quantity']);
        $this->assertEquals(3, $response['materials'][2]['id']);
        $this->assertEquals(2, $response['materials'][2]['pivot']['quantity']);
        $this->assertEquals(2, $response['materials'][3]['id']);
        $this->assertEquals(5, $response['materials'][3]['pivot']['quantity']);
    }

    public function testUpdateListTemplateNoData()
    {
        $this->client->put('/api/list-templates/1', []);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertErrorMessage("Aucune donnée à utiliser pour la modification.");
    }

    public function testUpdateListTemplateNotFound()
    {
        $this->client->put('/api/list-templates/999', ['name' => '__inexistant__']);
        $this->assertNotFound();
    }

    public function testUpdateListTemplate()
    {
        // - Changement du nom uniquement
        $data = [
            'name' => 'Liste modifiée',
        ];
        $this->client->put('/api/list-templates/1', $data);
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals(1, $response['id']);
        $this->assertEquals('Liste modifiée', $response['name']);
        $this->assertEquals('Une liste de matériel bien sympa.', $response['description']);
        $this->assertCount(3, $response['materials']);
        $this->assertEquals(4, $response['materials'][0]['id']);
        $this->assertEquals(2, $response['materials'][1]['id']);
        $this->assertEquals(1, $response['materials'][2]['id']);
    }

    public function testDeleteAndDestroyListTemplate()
    {
        // - First call : sets `deleted_at` not null
        $this->client->delete('/api/list-templates/1');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertNotEmpty($response['name']);

        // - Second call : actually DESTROY record from DB
        $this->client->delete('/api/list-templates/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['destroyed' => true]);
    }

    public function testRestoreListTemplate()
    {
        // - First, delete template #1
        $this->client->delete('/api/list-templates/1');
        $this->assertStatusCode(SUCCESS_OK);

        // - Then, restore template #1
        $this->client->put('/api/list-templates/restore/1');
        $this->assertStatusCode(SUCCESS_OK);
    }
}
