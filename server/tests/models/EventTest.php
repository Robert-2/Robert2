<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models;
use Robert2\API\Errors;

final class EventTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\Event();
    }

    public function testTableName(): void
    {
        $this->assertEquals('events', $this->model->getTable());
    }

    public function testGetAll(): void
    {
        $this->model->setPeriod('2018-01-15', '2018-12-19');
        $result = $this->model->getAll()->get()->toArray();
        $this->assertEquals([
            [
                'id' => 3,
                'user_id' => 1,
                'title' => "Avant-premier événement",
                'description' => null,
                'reference' => null,
                'start_date' => "2018-12-15 00:00:00",
                'end_date' => "2018-12-16 23:59:59",
                'is_confirmed' => false,
                'location' => "Brousse",
                'is_billable' => false,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 1,
                'user_id' => 1,
                'title' => "Premier événement",
                'description' => null,
                'reference' => null,
                'start_date' => "2018-12-17 00:00:00",
                'end_date' => "2018-12-18 23:59:59",
                'is_confirmed' => false,
                'location' => "Gap",
                'is_billable' => true,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'title' => "Second événement",
                'description' => null,
                'reference' => null,
                'start_date' => "2018-12-18 00:00:00",
                'end_date' => "2018-12-19 23:59:59",
                'is_confirmed' => false,
                'location' => "Lyon",
                'is_billable' => true,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ]
        ], $result);
    }

    public function testGetMissingMaterials(): void
    {
        // - No missing materials for event #3
        $result = $this->model->getMissingMaterials(3);
        $this->assertNull($result);

        // - Get missing materials of event #1
        $result = $this->model->getMissingMaterials(1);
        $this->assertCount(1, $result);
        $this->assertEquals('DBXPA2', $result[0]['reference']);
        $this->assertEquals(-1, $result[0]['remaining_quantity']);
    }

    public function testGetMaterials(): void
    {
        $Event = $this->model::find(1);
        $results = $Event->materials;
        $this->assertCount(3, $results);
        $expected = [
            'id'                    => 4,
            'name'                  => 'Showtec SDS-6',
            'description'           => "Console DMX (jeu d'orgue) Showtec 6 canaux",
            'reference'             => 'SDS-6-01',
            'is_unitary'            => false,
            'park_id'               => 1,
            'category_id'           => 2,
            'sub_category_id'       => 4,
            'rental_price'          => 15.95,
            'stock_quantity'        => 2,
            'out_of_order_quantity' => null,
            'replacement_price'     => 59.0,
            'is_hidden_on_bill'     => false,
            'is_discountable'       => true,
            'tags'                  => [],
            'attributes'            => [
                [
                    'id'    => 4,
                    'name'  => 'Conforme',
                    'type'  => 'boolean',
                    'unit'  => null,
                    'value' => true,
                ],
                [
                    'id'    => 3,
                    'name'  => 'Puissance',
                    'type'  => 'integer',
                    'unit'  => 'W',
                    'value' => 60,
                ],
                [
                    'id'    => 1,
                    'name'  => 'Poids',
                    'type'  => 'float',
                    'unit'  => 'kg',
                    'value' => 3.15,
                ],
            ],
            'pivot' => [
                'event_id'    => 1,
                'material_id' => 4,
                'quantity'    => 1,
            ],
        ];
        $this->assertEquals($expected, $results[0]);
    }

    public function testGetAssignees(): void
    {
        $Event   = $this->model::find(1);
        $results = $Event->assignees;
        $this->assertCount(2, $results);
    }

    public function testGetBeneficiaries(): void
    {
        $Event = $this->model::find(1);
        $results = $Event->beneficiaries;
        $this->assertEquals([
            [
                'id'          => 3,
                'first_name'  => 'Client',
                'last_name'   => 'Benef',
                'full_name'   => 'Client Benef',
                'street'      => '156 bis, avenue des tests poussés',
                'postal_code' => '88080',
                'locality'    => 'Wazzaville',
                'company_id'  => null,
                'company'     => null,
                'country'     => null,
                'pivot'       => ['event_id' => 1, 'person_id' => 3],
            ]
        ], $results);
    }

    public function testGetUser()
    {
        $Event = $this->model::find(1);
        $results = $Event->user;
        $expected = [
            'id'       => 1,
            'pseudo'   => 'test1',
            'email'    => 'tester@robertmanager.net',
            'group_id' => 'admin',
            'person'   => [
                'id'          => 1,
                'user_id'     => 1,
                'first_name'  => 'Jean',
                'last_name'   => 'Fountain',
                'nickname'    => null,
                'email'       => 'tester@robertmanager.net',
                'phone'       => null,
                'street'      => '1, somewhere av.',
                'postal_code' => '1234',
                'locality'    => 'Megacity',
                'country_id'  => 1,
                'company_id'  => 1,
                'note'        => null,
                'created_at'  => null,
                'updated_at'  => null,
                'deleted_at'  => null,
                'full_name'   => 'Jean Fountain',
                'company'     => [
                    'id'          => 1,
                    'legal_name'  => 'Testing, Inc',
                    'street'      => '1, company st.',
                    'postal_code' => '1234',
                    'locality'    => 'Megacity',
                    'country_id'  => 1,
                    'phone'       => '+4123456789',
                    'note'        => 'Just for tests',
                    'created_at'  => null,
                    'updated_at'  => null,
                    'deleted_at'  => null,
                    'country'     => [
                        'id'   => 1,
                        'name' => 'France',
                        'code' => 'FR',
                    ],
                ],
                'country' => [
                    'id'   => 1,
                    'name' => 'France',
                    'code' => 'FR',
                ],
            ],
        ];
        $this->assertEquals($expected, $results);
    }

    public function testGetBills()
    {
        $Event = $this->model::find(1);
        $results = $Event->bills;
        $expected = [
            [
                'id'            => 1,
                'number'        => '2020-00001',
                'date'          => '2020-01-30 14:00:00',
                'discount_rate' => 50.0,
                'due_amount'    => 325.5,
            ]
        ];
        $this->assertEquals($expected, $results);
    }

    public function testSetPeriod()
    {
        // - Set period to current year
        $this->model->setPeriod(null, null);
        $results = $this->model->getAll()->get()->toArray();
        $this->assertCount(0, $results);

        // - Set period to 2018
        $this->model->setPeriod('2018-01-01', '2018-12-31');
        $results = $this->model->getAll()->get()->toArray();
        $this->assertCount(3, $results);
        $this->assertEquals('Avant-premier événement', $results[0]['title']);

        // - Set period to last dec. 2018
        $this->model->setPeriod('2018-12-19', '2018-12-31');
        $results = $this->model->getAll()->get()->toArray();
        $this->assertCount(1, $results);
        $this->assertEquals('Second événement', $results[0]['title']);
    }

    public function testValidate(): void
    {
        $data = [
            'user_id'      => 1,
            'title'        => "Test dates validation",
            'start_date'   => '2020-03-01 00:00:00',
            'is_confirmed' => false,
        ];

        // - Validation pass: dates are OK
        $testData = array_merge(
            $data,
            ['end_date' => '2020-03-03 23:59:59']
        );
        $this->model->validate($testData);

        // - Validation fail: end date is after start date
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $testData = array_merge(
            $data,
            ['end_date' => '2020-02-20 23:59:59']
        );
        $this->model->validate($testData);
    }

    public function testValidateReference(): void
    {
        $data = [
            'user_id'      => 1,
            'title'        => "Test dates validation",
            'start_date'   => '2020-03-01 00:00:00',
            'end_date'     => '2020-03-03 23:59:59',
            'is_confirmed' => false,
        ];

        foreach (['REF1', null] as $testValue) {
            $testData = array_merge($data, ['reference' => $testValue]);
            $this->model->validate($testData);
        }

        // - Validation fail: Reference is an empty string
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $testData = array_merge($data, ['reference' => '']);
        $this->model->validate($testData);
    }

    public function testGetPdfContent()
    {
        $result = $this->model->getPdfContent(1);
        $this->assertNotEmpty($result);
    }
}
