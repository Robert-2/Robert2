<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\Enums\Group;
use Loxya\Models\User;

final class UserTest extends TestCase
{
    public function testFromLogin(): void
    {
        // - Avec un un couple d'identifiants inexistants.
        $this->assertException(ModelNotFoundException::class, static fn () => (
            User::fromLogin('foo', 'bar')
        ));

        // - Retourne l'utilisateur n°1 et sa personne associée en utilisant l'e-mail
        try {
            $resultUser = User::fromLogin('tester@robertmanager.net', 'testing-pw');
            $this->assertEquals(1, $resultUser->id);
        } catch (ModelNotFoundException) {
            $this->fail('The user has not been correctly retrieved.');
        }

        // - Retourne l'utilisateur n°1 et sa personne associée en utilisant le pseudo
        try {
            $resultUser = User::fromLogin('test1', 'testing-pw');
            $this->assertEquals(1, $resultUser->id);
        } catch (ModelNotFoundException) {
            $this->fail('The user has not been correctly retrieved.');
        }
    }

    public function testCreateWithoutData(): void
    {
        $this->expectException(ValidationException::class);
        User::new([]);
    }

    public function testCreateBadData(): void
    {
        $this->expectException(ValidationException::class);
        User::new(['pseudo' => 'Sans email!']);
    }

    public function testCreateWithoutPerson(): void
    {
        $this->expectException(ValidationException::class);
        User::new([
            'pseudo' => 'Owkay',
            'email' => 'owkay@test.org',
            'group' => Group::ADMIN,
            'password' => 'test-pw',
        ]);
    }

    public function testCreate(): void
    {
        $data = [
            'pseudo' => 'testAdd',
            'email' => 'testadd@testing.org',
            'password' => 'test-add',
            'group' => Group::MEMBER,
            'person' => [
                'first_name' => 'Testing',
                'last_name' => 'Add',
                'reference' => 'test1',
            ],
        ];

        $result = User::new($data);
        $this->assertEquals(6, $result->id);
        $this->assertEquals('testAdd', $result->pseudo);
        $this->assertEquals('testadd@testing.org', $result->email);
        $this->assertEquals(Group::MEMBER, $result->group);
        $this->assertEquals(8, $result->person->id);
        $this->assertEquals(6, $result->person->user_id);
        $this->assertEquals('Testing', $result->person->first_name);
        $this->assertEquals('Add', $result->person->last_name);
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
