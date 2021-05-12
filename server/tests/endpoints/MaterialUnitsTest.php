<?php
namespace Robert2\Tests;

final class MaterialUnitsTest extends ApiTestCase
{
    public function testGetUnit()
    {
        $this->client->get('/api/material-units/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'material_id' => 6,
            'serial_number' => 'XR18-1',
            'park_id' => 1,
            'is_broken' => false,
            'material' => [
                'id' => 6,
                'name' => 'Behringer X Air XR18',
                'reference' => 'XR18',
                'is_unitary' => true,
                'description' => 'Mélangeur numérique 18 canaux',
                'park_id' => null,
                'category_id' => 1,
                'sub_category_id' => 1,
                'rental_price' => 49.99,
                'stock_quantity' => 3,
                'out_of_order_quantity' => 1,
                'replacement_price' => 419,
                'is_hidden_on_bill' => false,
                'is_discountable' => false,
                'picture' => null,
                'note' => null,
                'attributes' => [
                    [
                        'id' => 5,
                        'name' => "Date d'achat",
                        'type' => "date",
                        'unit' => null,
                        'value' => '2021-01-28',
                    ],
                ],
                'units' => [
                    [
                        'id'            => 1,
                        'serial_number' => 'XR18-1',
                        'park_id'       => 1,
                        'is_broken'     => false,
                    ],
                    [
                        'id'            => 2,
                        'serial_number' => 'XR18-2',
                        'park_id'       => 1,
                        'is_broken'     => false,
                    ],
                    [
                        'id'            => 3,
                        'serial_number' => 'XR18-3',
                        'park_id'       => 2,
                        'is_broken'     => true,
                    ]
                ],
                'tags' => [],
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null
            ],
            'created_at' => null,
            'updated_at' => null,
        ]);
    }

    public function testCreateUnit(): void
    {
        $data = [
            'park_id' => 1,
            'serial_number' => 'VHCL-2',
            'is_broken' => true,
        ];
        $expectedData = [
            'id' => 7,
            'material_id' => 7,
            'park_id' => 1,
            'serial_number' => 'VHCL-2',
            'is_broken' => true,
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
        ];
        $this->client->post('/api/materials/7/units', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData($expectedData, ['created_at', 'updated_at']);
    }

    public function testCreateWithSensibleData()
    {
        $data = [
            'id' => 1000,
            'material_id' => 6,
            'park_id' => 2,
            'serial_number' => 'VHCL-3',
            'is_broken' => false,
        ];
        $expectedData = [
            'id' => 7,
            'material_id' => 7,
            'park_id' => 2,
            'serial_number' => 'VHCL-3',
            'is_broken' => false,
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
        ];
        $this->client->post('/api/materials/7/units', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData($expectedData, ['created_at', 'updated_at']);
    }

    public function testCreateUnitBadData()
    {
        $data = [
            'serial_number' => 'INV&LÎD',
            'is_broken' => false,
        ];
        $this->client->post('/api/materials/7/units', $data);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'park_id' => [
                "park_id must not be empty",
                "park_id must be numeric",
            ],
            'serial_number' => [
                'serial_number must contain only letters (a-z), digits (0-9) and "-+/*."',
            ]
        ]);
    }

    public function testCreateUnitMaterialNotFound(): void
    {
        $data = [
            'park_id' => 1,
            'serial_number' => 'UNKNOWN',
            'is_broken' => false,
        ];
        $this->client->post('/api/materials/1000/units', $data);
        $this->assertNotFound();
    }

    public function testCreateUnitMaterialNotUnitary(): void
    {
        $data = [
            'park_id' => 1,
            'serial_number' => 'NOT_UNITARY',
            'is_broken' => false,
        ];
        $this->client->post('/api/materials/1/units', $data);
        $this->assertNotFound();
    }

    public function testUpdateUnit(): void
    {
        // - Test simple.
        $data = ['is_broken' => true, 'park_id' => 2];
        $expectedData = [
            'id' => 1,
            'material_id' => 6,
            'park_id' => 2,
            'serial_number' => 'XR18-1',
            'is_broken' => true,
            'created_at' => null,
            'updated_at' => 'fakedTestContent',
        ];
        $this->client->put('/api/material-units/1', $data);
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData($expectedData, ['updated_at']);

        // - Test qu'on ne peut pas mettre à jour les données sensibles.
        $data = ['id' => 1000, 'material_id' => 7, 'is_broken' => true];
        $expectedData = [
            'id' => 5,
            'material_id' => 8,
            'park_id' => 1,
            'serial_number' => 'DECOR-FOREST-1',
            'is_broken' => true,
            'created_at' => null,
            'updated_at' => 'fakedTestContent',
        ];
        $this->client->put('/api/material-units/5', $data);
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData($expectedData, ['updated_at']);
    }

    public function testDeleteUnit(): void
    {
        $this->client->delete('/api/material-units/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([]);
    }
}
