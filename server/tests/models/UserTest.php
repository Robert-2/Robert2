<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models;
use Robert2\API\Errors;

final class UserTest extends ModelTestCase
{
    public function setup(): void
    {
        parent::setUp();

        $this->model = new Models\User();
    }

    public function testTableName(): void
    {
        $this->assertEquals('users', $this->model->getTable());
    }

    private $expectedDataUser1 = [
        'id'         => 1,
        'pseudo'     => 'test1',
        'email'      => 'tester@robertmanager.net',
        'group_id'   => 'admin',
        'created_at' => null,
        'updated_at' => null,
        'deleted_at' => null,
        'person'     => [
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
    ];

    public function testGetAll(): void
    {
        // - Retoure la liste des utilisateurs sous forme paginée
        $result   = $this->model->getAll()->get()->toArray();
        $expected = [
            [
                'id'         => 3,
                'pseudo'     => 'nobody',
                'email'      => 'nobody@robertmanager.net',
                'group_id'   => 'member',
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
                'person'     => null,
            ],
            $this->expectedDataUser1,
            [
                'id'         => 2,
                'pseudo'     => 'test2',
                'email'      => 'tester2@robertmanager.net',
                'group_id'   => 'member',
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
                'person'     => [
                    'id'          => 2,
                    'user_id'     => 2,
                    'first_name'  => 'Roger',
                    'last_name'   => 'Rabbit',
                    'full_name'   => 'Roger Rabbit',
                    'nickname'    => 'Riri',
                    'email'       => 'tester2@robertmanager.net',
                    'phone'       => null,
                    'street'      => null,
                    'postal_code' => null,
                    'locality'    => null,
                    'country_id'  => null,
                    'company_id'  => null,
                    'note'        => null,
                    'created_at'  => null,
                    'updated_at'  => null,
                    'deleted_at'  => null,
                    'company'     => null,
                    'country'     => null,
                ],
            ],
        ];
        $this->assertEquals($expected, $result);
    }

    public function testgetLoginNotFound(): void
    {
        $this->expectException(Errors\NotFoundException::class);
        $this->expectExceptionCode(ERROR_NOT_FOUND);
        $this->model->getLogin('foo', 'bar');
    }

    public function testGetLogin(): void
    {
        $expectedUserData = array_merge($this->expectedDataUser1, [
            'cas_identifier' => null,
            'settings' => [
                'id'                           => 1,
                'user_id'                      => 1,
                'language'                     => 'EN',
                'auth_token_validity_duration' => 12,
                'created_at'                   => null,
                'updated_at'                   => null
            ],
        ]);

        // - Retourne l'utilisateur n°1 et sa personne associée en utilisant l'e-mail
        $result = $this->model->getLogin('tester@robertmanager.net', 'testing-pw')->toArray();
        $this->assertEquals($expectedUserData, $result);

        // - Retourne l'utilisateur n°1 et sa personne associée en utilisant le pseudo
        $result = $this->model->getLogin('test1', 'testing-pw')->toArray();
        $this->assertEquals($expectedUserData, $result);
    }

    public function testCreateWithoutData(): void
    {
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Models\User::new([]);
    }

    public function testCreateBadData(): void
    {
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        Models\User::new(['foo' => 'bar']);
    }

    public function testUpdateNotFound(): void
    {
        $this->expectException(Errors\NotFoundException::class);
        $this->expectExceptionCode(ERROR_NOT_FOUND);
        $this->model->edit(999, []);
    }

    public function testCreate(): void
    {
        $data = [
            'pseudo' => 'testadd',
            'email' => 'testadd@robertmanager.net',
            'password' => 'testadd',
            'group_id' => 'member',
        ];

        $result = Models\User::new($data);
        $expected = [
            'id' => 4,
            'pseudo' => 'testadd',
            'email' => 'testadd@robertmanager.net',
            'group_id' => 'member',
            'cas_identifier' => null,
            'person' => null
        ];
        unset($result->created_at, $result->updated_at, $result->deleted_at);
        $this->assertEquals($expected, $result->toArray());

        // - Vérifie que les settings ont été créé
        $settings = Models\UserSetting::find(3);
        unset($settings->created_at);
        unset($settings->updated_at);
        $this->assertEquals([
            'id'                           => 3,
            'user_id'                      => 4,
            'language'                     => 'FR',
            'auth_token_validity_duration' => 12,
        ], $settings->toArray());
    }

    public function testCreateWithPerson(): void
    {
        $data = [
            'pseudo'   => 'testNewPerson',
            'email'    => 'testNewPerson@robertmanager.net',
            'password' => 'testNewPerson',
            'group_id' => 'member',
            'person'   => [
                'first_name' => 'New',
                'last_name'  => 'TestPerson',
                'nickname'   => 'testNewPerson',
            ],
        ];

        $result = Models\User::new($data);
        $this->assertEquals(4, $result['person']['id']);
        $this->assertEquals(4, $result['person']['user_id']);
        $this->assertEquals('testNewPerson', $result['person']['nickname']);
    }

    public function testCreateWithRestrictedParks(): void
    {
        $data = [
            'pseudo' => 'testNewPerson',
            'email' => 'testNewPerson@robertmanager.net',
            'password' => 'testNewPerson',
            'group_id' => 'member',
            'restricted_parks' => [1, 2],
        ];

        $result = Models\User::new($data);
        $this->assertEquals([2, 1], $result['restricted_parks']);
    }

    public function testUpdate(): void
    {
        $data = [
            'pseudo' => 'testUpdate',
            'email'  => 'testUpdate@robertmanager.net',
        ];

        $result = $this->model->edit(1, $data);
        $this->assertEquals('testUpdate', $result['pseudo']);

        // - Test update avec des données de "Person"
        $data = [
            'pseudo' => 'testEdit',
            'person' => [
                'first_name' => 'Testing',
                'last_name'  => 'Tester',
            ],
        ];
        $result = $this->model->edit(3, $data);
        $this->assertEquals('testEdit', $result['pseudo']);
        $this->assertEquals('Testing Tester', $result['person']['full_name']);

        // - Test update avec des restricted_parks
        $data = ['restricted_parks' => [1, 2]];
        $result = $this->model->edit(3, $data);
        $this->assertEquals([1, 2], $result['restricted_parks']);
    }

    public function testRemoveNotFound(): void
    {
        $this->expectException(Errors\NotFoundException::class);
        $this->expectExceptionCode(ERROR_NOT_FOUND);
        $this->model->remove(999);
    }

    public function testRemove(): void
    {
        // - Supprime (soft) l'utilisateur n°3
        $result = $this->model->remove(3)->toArray();
        $this->assertNotEmpty($result['deleted_at']);

        // - Supprime (hard) l'utilisateur n°3
        $result = $this->model->remove(3);
        $this->assertNull($result);

        // - Supprime (force) l'utilisateur n°2
        $result = $this->model->remove(2, ['force' => true]);
        $this->assertNull($result);
    }

    public function testExists(): void
    {
        $this->assertFalse($this->model->exists(999));
        $this->assertTrue($this->model->exists(1));
    }

    public function testGetSettings(): void
    {
        $User   = $this->model::find(1);
        $result = $User->settings;
        $this->assertEquals([
            'id'                           => 1,
            'user_id'                      => 1,
            'language'                     => 'EN',
            'auth_token_validity_duration' => 12,
            'created_at'                   => null,
            'updated_at'                   => null,
        ], $result);
    }

    public function testSetSettingsNotFound(): void
    {
        $this->expectException(Errors\NotFoundException::class);
        $this->expectExceptionCode(ERROR_NOT_FOUND);
        $this->model->setSettings(999, ['language' => 'FR']);
    }

    public function testSetSettingsBadData(): void
    {
        $this->expectException(Errors\ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $this->model->setSettings(1, ['language' => '__invalid__']);
    }

    public function testSetSettings(): void
    {
        $result = $this->model->setSettings(1, [
            'language'                     => 'FR',
            'auth_token_validity_duration' => 33,
        ]);
        unset($result['created_at']);
        unset($result['updated_at']);

        $this->assertEquals([
            'id'                           => 1,
            'user_id'                      => 1,
            'language'                     => 'FR',
            'auth_token_validity_duration' => 33,
        ], $result);
    }

    public function testGetEvents(): void
    {
        $User = $this->model::find(1);
        $results = $User->Events;
        $this->assertEquals([
            [
                'id'           => 3,
                'title'        => 'Avant-premier événement',
                'start_date'   => '2018-12-15 00:00:00',
                'end_date'     => '2018-12-16 23:59:59',
                'is_confirmed' => false,
            ],
            [
                'id'           => 1,
                'title'        => 'Premier événement',
                'start_date'   => '2018-12-17 00:00:00',
                'end_date'     => '2018-12-18 23:59:59',
                'is_confirmed' => false,
            ],
            [
                'id'           => 2,
                'title'        => 'Second événement',
                'start_date'   => '2018-12-18 00:00:00',
                'end_date'     => '2018-12-19 23:59:59',
                'is_confirmed' => false,
            ],
            [
                'id'           => 4,
                'title'        => 'Concert X',
                'start_date'   => '2019-03-01 00:00:00',
                'end_date'     => '2019-04-10 23:59:59',
                'is_confirmed' => false,
            ],
            [
                "id"           => 6,
                "title"        => "Un événement sans inspiration",
                "start_date"   => "2019-03-15 00:00:00",
                "end_date"     => "2019-04-01 23:59:59",
                "is_confirmed" => false,
            ],
            [
                'id'           => 5,
                'title'        => 'Kermesse de l\'école des trois cailloux',
                'start_date'   => '2020-01-01 00:00:00',
                'end_date'     => '2020-01-01 23:59:59',
                'is_confirmed' => false,
            ]
        ], $results);
    }

    public function testGetRestrictedParks(): void
    {
        // - Retourne la liste des IDs de parks dont l'accès
        // est restreint pour l'utilisateur #1
        $User = $this->model::find(1);
        $results = $User->RestrictedParks;
        $this->assertEquals([], $results);

        // - Retourne la liste des IDs de parks dont l'accès
        // est restreint pour l'utilisateur #2
        $User = $this->model::find(2);
        $results = $User->RestrictedParks;
        $this->assertEquals([2], $results);

        // - Retourne la liste des IDs de parks dont l'accès
        // est restreint pour l'utilisateur #3
        $User = $this->model::find(3);
        $results = $User->RestrictedParks;
        $this->assertEquals([2], $results);
    }
}
