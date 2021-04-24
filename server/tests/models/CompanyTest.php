<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Models;
use Robert2\API\Errors\ValidationException;

final class CompanyTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\Company();
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
                'id'          => 2,
                'legal_name'  => 'Obscure',
                'street'      => null,
                'postal_code' => null,
                'locality'    => null,
                'country_id'  => null,
                'phone'       => null,
                'note'        => null,
                'created_at'  => null,
                'updated_at'  => null,
                'deleted_at'  => null,
                'country'     => null,
            ],
            [
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
            ]
        ], $results);
    }

    public function testGetCountry(): void
    {
        $Company = $this->model::find(1);
        $this->assertEquals([
            'id'   => 1,
            'name' => 'France',
            'code' => 'FR',
        ], $Company->country);
    }

    public function testCreateCompanyWithoutData(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $this->model->edit(null, []);
    }

    public function testCreateCompanyBadData(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $this->model->edit(null, ['foo' => 'bar']);
    }

    public function testCreateCompanyDuplicate(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_DUPLICATE);
        $this->model->edit(null, ['legal_name' => 'Testing, Inc']);
    }

    public function testCreateCompany(): void
    {
        $data = [
            'legal_name'  => '  test company  ',
            'street'      => 'Somewhere street, 123',
            'postal_code' => '75000',
            'locality'    => 'Paris',
            'country_id'  => 1,
            'phone'       => '+00336 25 25 21 25',
        ];
        $result = $this->model->edit(null, $data);
        $expected = [
            'id'          => 3,
            'legal_name'  => 'test company',
            'street'      => 'Somewhere street, 123',
            'postal_code' => '75000',
            'locality'    => 'Paris',
            'country_id'  => 1,
            'phone'       => '+0033625252125',
            'note'        => null,
            'country'     => [
                'id'   => 1,
                'name' => 'France',
                'code' => 'FR',
            ],
        ];
        unset($result->created_at, $result->updated_at, $result->deleted_at);
        $this->assertEquals($expected, $result->toArray());
    }

    public function testCreateCompanyWithTags(): void
    {
        $data = [
            'legal_name' => 'test company',
            'tags'       => ['Bénéficiaire'],
        ];
        $result = $this->model->edit(null, $data);
        $data = $result->toArray();
        $this->assertEquals(3, $data['id']);
        $this->assertEquals('test company', $data['legal_name']);
        $expected = [
            ['id' => 4, 'name' => 'Bénéficiaire'],
        ];
        $this->assertEquals($expected, $result->tags);
    }

    public function testCreateCompanyWithPersons(): void
    {
        $data = [
            'legal_name'  => 'test company',
            'street'      => 'Somewhere street, 123',
            'postal_code' => '75000',
            'locality'    => 'Paris',
            'country_id'  => 1,
            'phone'       => '+00336 25 25 21 25',
            'persons'     => [
                ['first_name' => 'Laurent', 'last_name' => 'Bigboss']
            ],
        ];
        $result   = $this->model->edit(null, $data);
        $expected = [
            'id'          => 3,
            'legal_name'  => 'test company',
            'street'      => 'Somewhere street, 123',
            'postal_code' => '75000',
            'locality'    => 'Paris',
            'country_id'  => 1,
            'phone'       => '+0033625252125',
            'note'        => null,
            'country'     => [
                'id'   => 1,
                'name' => 'France',
                'code' => 'FR',
            ],
        ];
        unset($result->created_at, $result->updated_at, $result->deleted_at);
        $this->assertEquals($expected, $result->toArray());
    }

    public function testAddPersonsWithoutData(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->model->addPersons(1, []);
    }

    public function testAddPersonsToInexistant(): void
    {
        $this->expectException(ModelNotFoundException::class);
        $persons = [['first_name' => 'Laurent', 'last_name' => 'Bigboss']];
        $this->model->addPersons(999, $persons);
    }

    public function testAddPersons(): void
    {
        $persons = [
            ['first_name' => 'Laurent', 'last_name' => 'Bigboss'],
            ['first_name' => 'Jeanine', 'last_name' => 'Secretary']
        ];
        $result = $this->model->addPersons(1, $persons);
        $this->assertCount(3, $result);
    }
}
