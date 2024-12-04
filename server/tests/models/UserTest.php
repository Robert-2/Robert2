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
        $this->assertThrow(ModelNotFoundException::class, static fn () => (
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
            'group' => Group::ADMINISTRATION,
            'password' => 'test-pw',
        ]);
    }

    public function testCreate(): void
    {
        $data = [
            'pseudo' => 'testAdd',
            'email' => 'testadd@testing.org',
            'password' => 'test-add',
            'group' => Group::MANAGEMENT,
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
        $this->assertEquals(Group::MANAGEMENT, $result->group);
        $this->assertEquals(9, $result->person->id);
        $this->assertEquals(6, $result->person->user_id);
        $this->assertEquals('Testing', $result->person->first_name);
        $this->assertEquals('Add', $result->person->last_name);
    }

    public function testEdit(): void
    {
        $user = User::findOrFail(1)->edit([
            'pseudo' => 'test-edit',
            'email' => 'test-edit@robertmanager.net',
        ]);
        $this->assertEquals('test-edit', $user->pseudo);

        // - Test update avec des données de "Person"
        $user = User::findOrFail(3)->edit([
            'pseudo' => 'testEdit',
            'person' => [
                'first_name' => 'Testing',
                'last_name' => 'Tester',
            ],
        ]);
        $this->assertEquals('testEdit', $user->pseudo);
        $this->assertEquals('Testing Tester', $user->person->full_name);
    }
}
