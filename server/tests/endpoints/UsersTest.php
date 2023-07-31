<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Collection;
use Loxya\Models\Enums\Group;
use Loxya\Models\User;

final class UsersTest extends ApiTestCase
{
    public static function data(int $id, string $format = User::SERIALIZE_DEFAULT)
    {
        $users = new Collection([
            [
                'id' => 1,
                'pseudo' => 'test1',
                'first_name' => 'Jean',
                'last_name' => 'Fountain',
                'full_name' => 'Jean Fountain',
                'phone' => null,
                'email' => 'tester@robertmanager.net',
                'group' => Group::ADMIN,
                'language' => 'en',
                'notifications_enabled' => true,
            ],
            [
                'id' => 2,
                'pseudo' => 'test2',
                'first_name' => 'Roger',
                'last_name' => 'Rabbit',
                'full_name' => 'Roger Rabbit',
                'phone' => null,
                'email' => 'tester2@robertmanager.net',
                'group' => Group::MEMBER,
                'language' => 'fr',
                'notifications_enabled' => true,
            ],
            [
                'id' => 3,
                'pseudo' => 'nobody',
                'first_name' => null,
                'last_name' => null,
                'full_name' => null,
                'phone' => null,
                'email' => 'nobody@robertmanager.net',
                'group' => Group::MEMBER,
                'language' => 'fr',
                'notifications_enabled' => true,
            ],
            [
                'id' => 4,
                'pseudo' => 'TheVisitor',
                'first_name' => 'Henry',
                'last_name' => 'Berluc',
                'full_name' => 'Henry Berluc',
                'phone' => '+33724000000',
                'email' => 'visitor@robertmanager.net',
                'group' => Group::VISITOR,
                'language' => 'fr',
                'notifications_enabled' => false,
            ],
            [
                'id' => 5,
                'pseudo' => 'caroline',
                'first_name' => 'Caroline',
                'last_name' => 'Farol',
                'full_name' => 'Caroline Farol',
                'phone' => '+33786325500',
                'email' => 'external@robertmanager.net',
                'group' => Group::EXTERNAL,
                'language' => 'en',
                'notifications_enabled' => true,
            ],
        ]);

        $users = match ($format) {
            User::SERIALIZE_DEFAULT => $users,
            User::SERIALIZE_DETAILS => $users,
            default => throw new \InvalidArgumentException(sprintf("Unknown format \"%s\"", $format)),
        };

        return static::_dataFactory($id, $users->all());
    }

    public function testGetAll()
    {
        $this->client->get('/api/users');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(5, [
            self::data(5),
            self::data(3),
            self::data(1),
            self::data(2),
            self::data(4),
        ]);

        $this->client->get('/api/users?deleted=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(0);
    }

    public function testGetAllOnlyMembers()
    {
        $this->client->get(sprintf('/api/users?group=%s', Group::MEMBER));
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(2, [
            self::data(3),
            self::data(2),
        ]);
    }

    public function testGetOneNotFound()
    {
        $this->client->get('/api/users/9999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testForbidGetSelfWithId()
    {
        $this->client->get('/api/users/1');
        $this->assertStatusCode(StatusCode::STATUS_FORBIDDEN);
    }

    public function testGetOne()
    {
        $this->client->get('/api/users/self');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1, User::SERIALIZE_DETAILS));
    }

    public function testGetOneSettingsNotFound()
    {
        $this->client->get('/api/users/9999/settings');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testGetOneSettings()
    {
        $this->client->get('/api/users/1/settings');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'language' => 'en',
        ]);
    }

    public function testUpdateSettingsNoData()
    {
        $this->client->put('/api/users/1/settings', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testUpdateSettingsNoUser()
    {
        $this->client->put('/api/users/999/settings', ['language' => 'fr']);
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testUpdateSettings()
    {
        $this->client->put('/api/users/1/settings', [
            'language' => 'fr',
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'language' => 'fr',
        ]);
    }

    public function testCreateBadData()
    {
        $this->client->post('/api/users', [
            'email' => 'not-an-email',
            'first_name' => '',
            'last_name' => '',
        ]);
        $this->assertApiValidationError([
            'pseudo' => [
                "This field is mandatory",
            ],
            'email' => [
                "This email address is not valid",
            ],
            'group' => [
                "This field is mandatory",
                "One of the following rules must be verified",
                'Must equal "admin"',
                'Must equal "member"',
                'Must equal "visitor"',
                'Must equal "external"',
            ],
            'password' => [
                "This field is mandatory",
                "4 min. characters, 191 max. characters",
            ],
            'first_name' => [
                "This field is mandatory",
                "This field contains some unauthorized characters",
                "2 min. characters, 35 max. characters",
            ],
            'last_name' => [
                "This field is mandatory",
                "This field contains some unauthorized characters",
                "2 min. characters, 35 max. characters",
            ],
        ]);
    }

    public function testCreateDuplicate()
    {
        $this->client->post('/api/users', [
            'pseudo' => 'test1',
            'first_name' => 'Nouveau',
            'last_name' => 'Testeur',
            'email' => 'tester@robertmanager.net',
            'password' => 'test-dupe',
            'group' => Group::MEMBER,
        ]);
        $this->assertApiValidationError([
            'pseudo' => ["This pseudo is already in use"],
            'email' => ["This email is already in use"],
        ]);
    }

    public function testCreate()
    {
        $this->client->post('/api/users', [
            'email' => 'nobody@test.org',
            'pseudo' => 'Jeanne',
            'first_name' => 'Nobody',
            'last_name' => 'Testeur',
            'password' => 'my-ultim4te-paßwor!',
            'group' => Group::MEMBER,
        ]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 6,
            'first_name' => 'Nobody',
            'last_name' => 'Testeur',
            'full_name' => 'Nobody Testeur',
            'phone' => null,
            'email' => 'nobody@test.org',
            'pseudo' => 'Jeanne',
            'group' => Group::MEMBER,
            'language' => 'fr',
            'notifications_enabled' => true,
        ]);
    }

    public function testUpdateNoData()
    {
        $this->client->put('/api/users/2', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testUpdateNotFound()
    {
        $this->client->put('/api/users/999', ['pseudo' => '__inexistant__']);
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testForbidUpdateSelfWithId()
    {
        $this->client->put('/api/users/1', ['pseudo' => 'Admin']);
        $this->assertStatusCode(StatusCode::STATUS_FORBIDDEN);
    }

    public function testUpdate()
    {
        // - L'utilisateur lui-même
        $updatedData = ['pseudo' => 'Admin'];
        $this->client->put('/api/users/self', $updatedData);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace(
            self::data(1, User::SERIALIZE_DETAILS),
            $updatedData
        ));

        // - Un autre utilisateur (en tant qu'admin)
        $updatedData = [
            'pseudo' => 'userEdited',
            'first_name' => 'Edited',
            'last_name' => 'Tester',
            'full_name' => 'Edited Tester',
            'group' => Group::ADMIN,
        ];
        $this->client->put('/api/users/3', $updatedData);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace(
            self::data(3, User::SERIALIZE_DETAILS),
            $updatedData
        ));
    }

    public function testDeleteAndDestroy()
    {
        // - First call: soft delete.
        $this->client->delete('/api/users/3');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $softDeleted = User::withTrashed()->find(3);
        $this->assertNotNull($softDeleted);
        $this->assertNotEmpty($softDeleted->deleted_at);

        // - Second call: actually DESTROY record from DB
        $this->client->delete('/api/users/3');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $this->assertNull(User::withTrashed()->find(3));

        // - Test de suppression d'un utilisateur qui a un bénéficiaire lié
        $this->client->delete('/api/users/2');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $user = User::withTrashed()->find(2);
        $this->assertNotNull($user);
        $this->assertNotEmpty($user->deleted_at);
    }

    public function testRestoreNotFound()
    {
        $this->client->put('/api/users/restore/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testRestore()
    {
        // - First, delete user #2
        $this->client->delete('/api/users/2');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);

        // - Then, restore user #2
        $this->client->put('/api/users/restore/2');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertNotNull(User::find(2));
    }
}
