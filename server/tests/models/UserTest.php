<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Enums\Group;
use Robert2\API\Models\User;
use Robert2\API\Models\UserSetting;

final class UserTest extends TestCase
{
    public function testFromLoginNotFound(): void
    {
        $this->expectException(ModelNotFoundException::class);
        User::fromLogin('foo', 'bar');
    }

    public function testFromLogin(): void
    {
        // - Retourne l'utilisateur n°1 et sa personne associée en utilisant l'e-mail
        try {
            $resultUser = User::fromLogin('tester@robertmanager.net', 'testing-pw');
            $this->assertEquals(1, $resultUser->id);
        } catch (ModelNotFoundException $e) {
            $this->fail('The user has not been correctly retrieved.');
        }

        // - Retourne l'utilisateur n°1 et sa personne associée en utilisant le pseudo
        try {
            $resultUser = User::fromLogin('test1', 'testing-pw');
            $this->assertEquals(1, $resultUser->id);
        } catch (ModelNotFoundException $e) {
            $this->fail('The user has not been correctly retrieved.');
        }
    }

    public function testCreateWithoutData(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        User::new([]);
    }

    public function testCreateBadData(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        User::new(['pseudo' => 'Sans email!']);
    }

    public function testCreateWithoutPerson(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        User::new([
            'pseudo' => 'owkay',
            'email' => 'owkay@test.org',
            'group' => Group::ADMIN,
            'password' => 'testpw',
        ]);
    }

    public function testCreate(): void
    {
        $data = [
            'pseudo' => 'testAdd',
            'email' => 'testadd@testing.org',
            'password' => 'testadd',
            'group' => Group::MEMBER,
            'person' => [
                'first_name' => 'Testing',
                'last_name' => 'Add',
                'reference' => 'test1',
            ],
        ];

        $result = User::new($data);
        $this->assertEquals(4, $result->id);
        $this->assertEquals('testAdd', $result->pseudo);
        $this->assertEquals('testadd@testing.org', $result->email);
        $this->assertEquals(Group::MEMBER, $result->group);
        $this->assertNull($result->cas_identifier);
        $this->assertEquals(5, $result->person->id);
        $this->assertEquals(4, $result->person->user_id);
        $this->assertEquals('Testing', $result->person->first_name);
        $this->assertEquals('Add', $result->person->last_name);

        // - Vérifie que les settings ont été créé
        $settings = UserSetting::find(3);
        unset($settings->created_at);
        unset($settings->updated_at);
        $this->assertEquals([
            'id' => 3,
            'user_id' => 4,
            'language' => 'fr',
            'auth_token_validity_duration' => 12,
        ], $settings->toArray());
    }

    public function testUpdateNotFound(): void
    {
        $this->expectException(ModelNotFoundException::class);
        User::staticEdit(999, []);
    }
    public function testUpdate(): void
    {
        $data = [
            'pseudo' => 'testUpdate',
            'email' => 'testUpdate@robertmanager.net',
        ];

        $result = User::staticEdit(1, $data);
        $this->assertEquals('testUpdate', $result->pseudo);

        // - Test update avec des données de "Person"
        $data = [
            'pseudo' => 'testEdit',
            'person' => [
                'first_name' => 'Testing',
                'last_name' => 'Tester',
            ],
        ];
        $result = User::staticEdit(3, $data);
        $this->assertEquals('testEdit', $result->pseudo);
        $this->assertEquals('Testing Tester', $result->person->full_name);
    }
}
