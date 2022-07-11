<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models\Company;
use Robert2\API\Errors\ValidationException;

final class CompanyTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Company();
    }

    public function testTableName(): void
    {
        $this->assertEquals('companies', $this->model->getTable());
    }

    public function testGetAll(): void
    {
        $results = $this->model->getAll()->get()->toArray();
        $expected = [
            [
                'id' => 2,
                'legal_name' => 'Obscure',
                'street' => null,
                'postal_code' => null,
                'locality' => null,
                'country_id' => null,
                'full_address' => null,
                'phone' => null,
                'note' => null,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
                'country' => null,
            ],
            [
                'id' => 1,
                'legal_name' => 'Testing, Inc',
                'street' => '1, company st.',
                'postal_code' => '1234',
                'locality' => 'Megacity',
                'country_id' => 1,
                'full_address' => "1, company st.\n1234 Megacity",
                'phone' => '+4123456789',
                'note' => 'Just for tests',
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
                'country' => [
                    'id' => 1,
                    'name' => 'France',
                    'code' => 'FR',
                ],
            ],
        ];
        $this->assertEquals($expected, $results);
    }

    public function testSetSearch(): void
    {
        // - Empty search
        $this->model->setSearch();
        $results = $this->model->getAll()->get()->toArray();
        $this->assertCount(2, $results);
        $this->assertEquals('Obscure', $results[0]['legal_name']);

        // - Search a company legal name
        $this->model->setSearch('testin');
        $results = $this->model->getAll()->get()->toArray();
        $this->assertCount(1, $results);
        $this->assertEquals('Testing, Inc', $results[0]['legal_name']);

        // - Search with not allowed field
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Search field « postal_code » not allowed.");
        $this->model->setSearch('1234', 'postal_code');
    }

    public function testGetPersons(): void
    {
        $Company = $this->model::find(1);
        $results = $Company->persons;
        $this->assertEquals([
            [
                'id' => 1,
                'user_id' => 1,
                'first_name' => 'Jean',
                'last_name' => 'Fountain',
                'reference' => '0001',
                'nickname' => null,
                'email' => 'tester@robertmanager.net',
                'phone' => null,
                'street' => '1, somewhere av.',
                'postal_code' => '1234',
                'locality' => 'Megacity',
                'full_address' => "1, somewhere av.\n1234 Megacity",
                'country_id' => 1,
                'company_id' => 1,
                'note' => null,
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
                'full_name' => 'Jean Fountain',
                'company' => [
                    'id' => 1,
                    'legal_name' => 'Testing, Inc',
                    'street' => '1, company st.',
                    'postal_code' => '1234',
                    'locality' => 'Megacity',
                    'country_id' => 1,
                    'full_address' => "1, company st.\n1234 Megacity",
                    'phone' => '+4123456789',
                    'note' => 'Just for tests',
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                    'country' => [
                        'id' => 1,
                        'name' => 'France',
                        'code' => 'FR',
                    ],
                ],
                'country' => [
                    'id' => 1,
                    'name' => 'France',
                    'code' => 'FR',
                ],
            ]
        ], $results);
    }

    public function testGetCountry(): void
    {
        $Company = $this->model::find(1);
        $this->assertEquals([
            'id' => 1,
            'name' => 'France',
            'code' => 'FR',
        ], $Company->country);
    }

    public function testCreateCompanyWithoutData(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Company::staticEdit(null, []);
    }

    public function testCreateCompanyBadData(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Company::staticEdit(null, ['foo' => 'bar']);
    }

    public function testCreateCompanyDuplicate(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Company::staticEdit(null, ['legal_name' => 'Testing, Inc']);
    }

    public function testCreateCompany(): void
    {
        $data = [
            'legal_name' => '  test company  ',
            'street' => 'Somewhere street, 123',
            'postal_code' => '75000',
            'locality' => 'Paris',
            'country_id' => 1,
            'phone' => '+00336 25 25 21 25',
        ];
        $result = Company::staticEdit(null, $data);
        $expected = [
            'id' => 3,
            'legal_name' => 'test company',
            'street' => 'Somewhere street, 123',
            'postal_code' => '75000',
            'locality' => 'Paris',
            'country_id' => 1,
            'full_address' => "Somewhere street, 123\n75000 Paris",
            'phone' => '+0033625252125',
            'note' => null,
            'country' => [
                'id' => 1,
                'name' => 'France',
                'code' => 'FR',
            ],
        ];
        unset($result->created_at, $result->updated_at, $result->deleted_at);
        $this->assertEquals($expected, $result->toArray());
    }

    public function testCreateCompanyWithPersons(): void
    {
        $data = [
            'legal_name' => 'test company',
            'street' => 'Somewhere street, 123',
            'postal_code' => '75000',
            'locality' => 'Paris',
            'country_id' => 1,
            'phone' => '+00336 25 25 21 25',
            'persons' => [
                ['first_name' => 'Laurent', 'last_name' => 'Bigboss']
            ],
        ];
        $result = Company::staticEdit(null, $data);
        $expected = [
            'id' => 3,
            'legal_name' => 'test company',
            'street' => 'Somewhere street, 123',
            'postal_code' => '75000',
            'locality' => 'Paris',
            'country_id' => 1,
            'full_address' => "Somewhere street, 123\n75000 Paris",
            'phone' => '+0033625252125',
            'note' => null,
            'country' => [
                'id' => 1,
                'name' => 'France',
                'code' => 'FR',
            ],
        ];
        unset($result->created_at, $result->updated_at, $result->deleted_at);
        $this->assertEquals($expected, $result->toArray());
    }

    public function testCreateCompanyWithPersonsBadData(): void
    {
        $data = [
            'legal_name' => 'test company',
            'street' => 'Somewhere street, 123',
            'postal_code' => '75000',
            'locality' => 'Paris',
            'country_id' => 1,
            'phone' => '+00336 25 25 21 25',
            'persons' => [
                ['first_name' => 'N', 'last_name' => null]
            ],
        ];
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $result = Company::staticEdit(null, $data);
    }
}
