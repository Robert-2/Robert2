<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models;
use Robert2\API\Errors;

final class PersonTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\Person();
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
    }

    public function testGetAllFilteredOrTagged(): void
    {
        // - Récupération du matériel associées au tag "pro"
        $tags = ['customers'];
        $result = $this->model->getAllFilteredOrTagged([], $tags)->get()->toArray();
        $this->assertCount(1, $result);

        $options = ['country_id' => 1];
        $result = $this->model->getAllFilteredOrTagged($options, $tags)->get()->toArray();
        $this->assertEmpty($result);
    }

    public function testGetUser(): void
    {
        $Person = $this->model::find(1);
        $this->assertEquals([
            'id'       => 1,
            'pseudo'   => 'test1',
            'email'    => 'tester@robertmanager.net',
            'group_id' => 'admin',
            'person'   => [
                'id'          => 1,
                'user_id'     => 1,
                'first_name'  => 'Jean',
                'last_name'   => 'Fountain',
                'full_name'   => 'Jean Fountain',
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
        ], $Person->user);
    }

    public function testGetCompany(): void
    {
        $Person = $this->model::find(1);
        $this->assertEquals([
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
        ], $Person->company);
    }

    public function testGetTags(): void
    {
        $Person   = $this->model::find(2);
        $expected = [
            ['id' => 1, 'name' => 'tag 01'],
            ['id' => 2, 'name' => 'customers'],
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
        $this->expectException(Errors\NotFoundException::class);
        $this->model->setTags(999, ['notFoundTag']);
    }

    public function testSetTags(): void
    {
        // - Empty tags
        $result = $this->model->setTags(1, []);
        $expected = [];
        $this->assertEquals($expected, $result);

        // - Set tags : one existing, and two new tags
        $result = $this->model->setTags(2, ['customers', 'testTag', 'Last tag on the road']);
        $expected = [
            ['id' => 2, 'name' => 'customers'],
            ['id' => 4, 'name' => 'testTag'],
            ['id' => 5, 'name' => 'Last tag on the road'],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testCreatePersonWithoutData(): void
    {
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $this->model->edit(null, []);
    }

    public function testCreatePersonBadData(): void
    {
        $this->expectException(Errors\ValidationException::class);
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
        $this->assertNotEmpty($result);
    }

    public function testCreatePerson(): void
    {
        // - Test d'ajout de personne, avec n° de téléphone et tags
        $result = $this->model->edit(null, [
            'first_name' => 'New',
            'last_name'  => 'Tester',
            'nickname'   => 'Jackmayol',
            'email'      => 'tester3@robertmanager.net',
            'phone'      => '+331 23 45 67 89',
            'tags'       => ['newbie', 'people'],
        ]);
        $expected = [
            'id'         => 4,
            'first_name' => 'New',
            'last_name'  => 'Tester',
            'full_name'  => 'New Tester',
            'nickname'   => 'Jackmayol',
            'email'      => 'tester3@robertmanager.net',
            'phone'      => '+33123456789',
            'company'    => null,
            'country'    => null,
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
            'last_name'  => 'Phoner',
            'nickname'   => 'Fonfon',
            'email'      => 'fonfon@robertmanager.net',
            'phone'      => 'notAphoneNumber',
        ]);
    }
}
