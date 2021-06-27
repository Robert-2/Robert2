<?php
namespace Robert2\Tests;

use Robert2\API\Models\Person;

final class MaterialUnitsTest extends ApiTestCase
{
    public function testGetUnit()
    {
        $unitOwner = Person::find(1)->toArray();

        $this->client->get('/api/material-units/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'material_id' => 6,
            'reference' => 'XR18-1',
            'serial_number' => null,
            'park_id' => 1,
            'person_id' => 1,
            'is_broken' => false,
            'is_lost' => false,
            'material_unit_state_id' => 1,
            'purchase_date' => '2020-02-01',
            'notes' => 'Ce bon vieux XR-18',
            'owner' => $unitOwner,
            'state' => [
                'id' => 1,
                'name' => 'Bon état',
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
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
                        'id' => 1,
                        'reference' => 'XR18-1',
                        'serial_number' => null,
                        'park_id' => 1,
                        'person_id' => 1,
                        'is_broken' => false,
                        'is_lost' => false,
                        'material_unit_state_id' => 1,
                        'purchase_date' => '2020-02-01',
                        'notes' => 'Ce bon vieux XR-18',
                        'owner' => $unitOwner,
                        'state' => [
                            'id' => 1,
                            'name' => 'Bon état',
                            'created_at' => null,
                            'updated_at' => null,
                            'deleted_at' => null,
                        ],
                        'created_at' => null,
                    ],
                    [
                        'id' => 2,
                        'reference' => 'XR18-2',
                        'serial_number' => null,
                        'park_id' => 1,
                        'person_id' => null,
                        'is_broken' => false,
                        'is_lost' => false,
                        'material_unit_state_id' => 2,
                        'purchase_date' => null,
                        'notes' => null,
                        'owner' => null,
                        'state' => [
                            'id' => 2,
                            'name' => 'État médiocre',
                            'created_at' => null,
                            'updated_at' => null,
                            'deleted_at' => null,
                        ],
                        'created_at' => null,
                    ],
                    [
                        'id' => 3,
                        'reference' => 'XR18-3',
                        'serial_number' => null,
                        'park_id' => 2,
                        'person_id' => null,
                        'is_broken' => true,
                        'is_lost' => false,
                        'material_unit_state_id' => null,
                        'purchase_date' => null,
                        'notes' => null,
                        'owner' => null,
                        'state' => null,
                        'created_at' => null,
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
            'reference' => 'VHCL-2',
            'serial_number' => '123456-000020',
            'is_broken' => true,
        ];
        $expectedData = [
            'id' => 7,
            'material_id' => 7,
            'park_id' => 1,
            'person_id' => null,
            'reference' => 'VHCL-2',
            'serial_number' => '123456-000020',
            'is_broken' => true,
            'is_lost' => false,
            'material_unit_state_id' => null,
            'purchase_date' => null,
            'notes' => null,
            'owner' => null,
            'state' => null,
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
            'person_id' => null,
            'reference' => 'VHCL-3',
            'serial_number' => '123456-000030',
            'is_broken' => false,
            'is_lost' => true,
            'material_unit_state_id' => 2,
            'purchase_date' => '2020-02-02',
            'notes' => 'On a perdu ceci!',
        ];
        $expectedData = [
            'id' => 7,
            'material_id' => 7,
            'park_id' => 2,
            'person_id' => null,
            'reference' => 'VHCL-3',
            'serial_number' => '123456-000030',
            'is_broken' => false,
            'is_lost' => true,
            'material_unit_state_id' => 2,
            'purchase_date' => '2020-02-02',
            'notes' => 'On a perdu ceci!',
            'owner' => null,
            'state' => [
                'id' => 2,
                'name' => 'État médiocre',
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
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
            'reference' => 'INV&LÎD',
            'serial_number' => 'INV&LÎD',
            'is_broken' => false,
            'is_lost' => false,
            'purchase_date' => 'Not a date',
        ];
        $this->client->post('/api/materials/7/units', $data);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'park_id' => [
                "park_id must not be empty",
                "park_id must be numeric",
            ],
            'reference' => [
                'reference must contain only letters (a-z), digits (0-9) and "-+/*._"',
            ],
            'serial_number' => [
                'serial_number must contain only letters (a-z), digits (0-9) and "-+/*._"',
            ],
            'purchase_date' => [
                'purchase_date must be a valid date',
            ],
        ]);
    }

    public function testCreateUnitMaterialNotFound(): void
    {
        $data = [
            'park_id' => 1,
            'reference' => 'UNKNOWN',
            'serial_number' => null,
            'is_broken' => false,
        ];
        $this->client->post('/api/materials/1000/units', $data);
        $this->assertNotFound();
    }

    public function testCreateUnitMaterialNotUnitary(): void
    {
        $data = [
            'park_id' => 1,
            'reference' => 'NOT_UNITARY',
            'serial_number' => null,
            'is_broken' => false,
        ];
        $this->client->post('/api/materials/1/units', $data);
        $this->assertNotFound();
    }

    public function testUpdateUnit(): void
    {
        // - Test simple.
        $data = [
            'is_broken' => true,
            'park_id' => 2,
            'person_id' => null,
            'material_unit_state_id' => 1,
            'purchase_date' => '2020-05-31',
            'notes' => 'Une petite note',
        ];
        $expectedData = [
            'id' => 1,
            'material_id' => 6,
            'park_id' => 2,
            'person_id' => null,
            'reference' => 'XR18-1',
            'serial_number' => null,
            'is_broken' => true,
            'is_lost' => false,
            'material_unit_state_id' => 1,
            'purchase_date' => '2020-05-31',
            'notes' => 'Une petite note',
            'owner' => null,
            'state' => [
                'id' => 1,
                'name' => 'Bon état',
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
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
            'person_id' => null,
            'reference' => 'DECOR-FOREST-1',
            'serial_number' => null,
            'is_broken' => true,
            'is_lost' => false,
            'material_unit_state_id' => null,
            'purchase_date' => null,
            'notes' => null,
            'owner' => null,
            'state' => null,
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
