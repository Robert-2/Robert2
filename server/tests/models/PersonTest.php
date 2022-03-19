<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Models;
use Robert2\API\Errors\ValidationException;

final class PersonTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\Person();
    }

    public function testTableName(): void
    {
        $this->assertEquals('persons', $this->model->getTable());
    }

    public function testGetAll(): void
    {
        $result = $this->model->getAll()->get()->toArray();
        $this->assertCount(3, $result);
    }

    public function testSetSearch(): void
    {
        $this->model->setSearch('Jean');
        $result = $this->model->getAll()->get()->toArray();
        $this->assertCount(1, $result);
        $this->assertEquals('Jean Fountain', $result[0]['full_name']);

        $this->model->setSearch('Fount');
        $result = $this->model->getAll()->get()->toArray();
        $this->assertCount(1, $result);
        $this->assertEquals('Jean Fountain', $result[0]['full_name']);

        // - Search by reference
        $this->model->setSearch('01');
        $result = $this->model->getAll()->get()->toArray();
        $this->assertCount(1, $result);
        $this->assertEquals('Jean Fountain', $result[0]['full_name']);
        $this->assertEquals('0001', $result[0]['reference']);

        // - Search by company name
        $this->model->setSearch('Testing');
        $result = $this->model->getAll()->get()->toArray();
        $this->assertCount(1, $result);
        $this->assertEquals('Jean Fountain', $result[0]['full_name']);
        $this->assertEquals(1, $result[0]['company_id']);
    }

    public function testGetAllFilteredOrTagged(): void
    {
        // - Récupération du matériel associées au tag "Beneficiary"
        $tags = ['Beneficiary'];
        $result = $this->model->getAllFilteredOrTagged([], $tags)->get()->toArray();
        $this->assertCount(1, $result);

        $options = ['country_id' => 1];
        $result = $this->model->getAllFilteredOrTagged($options, $tags)->get()->toArray();
        $this->assertEmpty($result);
    }

    public function testGetPerson(): void
    {
        $Person = $this->model::find(1);
        $this->assertEquals([
            'id' => 1,
            'pseudo' => 'test1',
            'email' => 'tester@robertmanager.net',
            'group_id' => 'admin',
            'person' => [
                'id' => 1,
                'user_id' => 1,
                'first_name' => 'Jean',
                'last_name' => 'Fountain',
                'full_name' => 'Jean Fountain',
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
            ],
        ], $Person->user);
    }

    public function testGetCompany(): void
    {
        $Person = $this->model::find(1);
        $this->assertEquals([
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
        ], $Person->company);
    }

    public function testGetTags(): void
    {
        $Person   = $this->model::find(2);
        $expected = [
            ['id' => 1, 'name' => 'Technician'],
            ['id' => 2, 'name' => 'Beneficiary'],
        ];
        $this->assertEquals($expected, $Person->tags);
    }

    public function testSetTagsNoData(): void
    {
        $result = $this->model->setTags(1, null);
        $this->assertEmpty($result);

        $result = $this->model->setTags(1, []);
        $this->assertEmpty($result);
    }

    public function testSetTagsNotFound(): void
    {
        $this->expectException(ModelNotFoundException::class);
        $this->model->setTags(999, ['notFoundTag']);
    }

    public function testSetTags(): void
    {
        // - Empty tags
        $result = $this->model->setTags(1, []);
        $expected = [];
        $this->assertEquals($expected, $result);

        // - Set tags : one existing, and two new tags
        $result = $this->model->setTags(2, ['Beneficiary', 'testTag', 'Last tag on the road']);
        $expected = [
            ['id' => 2, 'name' => 'Beneficiary'],
            ['id' => 4, 'name' => 'testTag'],
            ['id' => 5, 'name' => 'Last tag on the road'],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testCreatePersonWithoutData(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $this->model->edit(null, []);
    }

    public function testCreatePersonBadData(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $this->model->edit(null, ['foo' => 'bar']);
    }

    public function testCreatePersonDuplicate(): void
    {
        $result = $this->model->edit(null, [
            'first_name' => 'Jean',
            'last_name' => 'Fountain',
            'email' => 'tester@robertmanager.net',
        ]);
        $resultData = $result->toArray();
        $this->assertEquals('1, somewhere av.', $resultData['street']);
        $this->assertEquals('1234', $resultData['postal_code']);
        $this->assertEquals('Megacity', $resultData['locality']);
    }

    public function testCreatePersonDuplicateRef(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $this->model->edit(null, [
            'first_name' => 'Paul',
            'last_name' => 'Newtests',
            'email' => 'paul@tests.new',
            'reference' => '0001',
        ]);
    }

    public function testCreatePerson(): void
    {
        // - Test d'ajout de personne, avec n° de téléphone et tags
        $result = $this->model->edit(null, [
            'first_name' => 'New',
            'last_name' => 'Tester',
            'nickname' => 'Jackmayol',
            'email' => 'tester3@robertmanager.net',
            'phone' => '+331 23 45 67 89',
            'tags' => ['newbie', 'people'],
        ]);
        $expected = [
            'id' => 4,
            'first_name' => 'New',
            'last_name' => 'Tester',
            'full_name' => 'New Tester',
            'nickname' => 'Jackmayol',
            'email' => 'tester3@robertmanager.net',
            'phone' => '+33123456789',
            'company' => null,
            'country' => null,
            'full_address' => null,
        ];
        unset($result->created_at);
        unset($result->updated_at);
        $this->assertEquals($expected, $result->toArray());

        $NewPerson = $this->model::find($result['id']);
        $this->assertEquals([
            ['id' => 4, 'name' => 'newbie'],
            ['id' => 5, 'name' => 'people'],
        ], $NewPerson->tags);

        // - Test avec un n° de téléphone erroné
        $this->expectExceptionCode(ERROR_VALIDATION);
        $this->model->edit(null, [
            'first_name' => 'Tester',
            'last_name' => 'Phoner',
            'nickname' => 'Fonfon',
            'email' => 'fonfon@robertmanager.net',
            'phone' => 'notAphoneNumber',
        ]);
    }

    public function testUpdatePerson(): void
    {
        $result = $this->model->edit(1, [
            'first_name' => '  Jeannot ',
            'nickname' => ' testMan  ',
            'reference' => '0003',
        ]);
        $expected = [
            'id' => 1,
            'user_id' => 1,
            'first_name' => 'Jeannot',
            'last_name' => 'Fountain',
            'full_name' => 'Jeannot Fountain',
            'reference' => '0003',
            'nickname' => 'testMan',
            'email' => 'tester@robertmanager.net',
            'phone' => null,
            'street' => '1, somewhere av.',
            'postal_code' => '1234',
            'locality' => 'Megacity',
            'country_id' => 1,
            'full_address' => "1, somewhere av.\n1234 Megacity",
            'company_id' => 1,
            'note' => null,
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
        ];
        unset($result->created_at);
        unset($result->updated_at);
        unset($result->deleted_at);
        $this->assertEquals($expected, $result->toArray());
    }

    public function testUpdatePersonDuplicateRef(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $this->model->edit(1, [
            'first_name' => '  Jeannot ',
            'nickname' => ' testMan  ',
            'reference' => '0002',
        ]);
    }
}
