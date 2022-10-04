<?php
namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Collection;
use Robert2\API\Models\Enums\Group;
use Robert2\API\Models\User;

final class UsersTest extends ApiTestCase
{
    public static function data(int $id, $details = false)
    {
        $attributes = new Collection([
            [
                'id' => 1,
                'pseudo' => 'test1',
                'first_name' => 'Jean',
                'last_name' => 'Fountain',
                'full_name' => 'Jean Fountain',
                'phone' => null,
                'email' => 'tester@robertmanager.net',
                'group' => Group::ADMIN,
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
            ],
        ]);

        return static::_dataFactory($id, $attributes->all());
    }

    public function testGetAll()
    {
        $this->client->get('/api/users');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(3, [
            self::data(3),
            self::data(1),
            self::data(2),
        ]);

        $this->client->get('/api/users?deleted=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(0);
    }

    public function testGetOneNotFound()
    {
        $this->client->get('/api/users/9999');
        $this->assertNotFound();
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
        $this->assertResponseData(self::data(1, true));
    }

    public function testGetOneSettingsNotFound()
    {
        $this->client->get('/api/users/9999/settings');
        $this->assertNotFound();
    }

    public function testGetOneSettingsNoSettingFound()
    {
        $this->client->get('/api/users/3/settings');
        $this->assertNotFound();
    }

    public function testGetOneSettings()
    {
        $this->client->get('/api/users/1/settings');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'id' => 1,
            'user_id' => 1,
            'language' => 'en',
            'auth_token_validity_duration' => 12,
            'created_at' => null,
            'updated_at' => null,
        ]);
    }

    public function testUpdateSettingsNoData()
    {
        $this->client->put('/api/users/1/settings', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertErrorMessage("No data was provided.");
    }

    public function testUpdateSettingsNoUser()
    {
        $this->client->put('/api/users/999/settings', ['language' => 'fr']);
        $this->assertNotFound();
    }

    public function testUpdateSettings()
    {
        $this->client->put('/api/users/1/settings', [
            'language' => 'fr',
            'auth_token_validity_duration' => 72,
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals('fr', $response['language']);
        $this->assertEquals(72, $response['auth_token_validity_duration']);
    }

    public function testCreateBadData()
    {
        $this->client->post('/api/users', [
            'email' => 'not-an-email',
            'first_name' => '',
            'last_name' => '',
        ]);
        $this->assertValidationError([
            'pseudo' => [
                "This field is mandatory",
            ],
            'email' => [
                "This email address is not valid",
            ],
            'group' => [
                "This field is mandatory",
                "One of the following rules must be verified",
                'Must be equal to "admin"',
                'Must be equal to "member"',
                'Must be equal to "visitor"',
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
        $this->assertValidationError([
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
            'id' => 4,
            'first_name' => 'Nobody',
            'last_name' => 'Testeur',
            'full_name' => 'Nobody Testeur',
            'phone' => null,
            'email' => 'nobody@test.org',
            'pseudo' => 'Jeanne',
            'group' => Group::MEMBER,
        ]);
    }

    public function testUpdateNoData()
    {
        $this->client->put('/api/users/2', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertErrorMessage("No data was provided.");
    }

    public function testUpdateNotFound()
    {
        $this->client->put('/api/users/999', ['pseudo' => '__inexistant__']);
        $this->assertNotFound();
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
        $this->assertResponseData(
            array_replace(self::data(1, true), $updatedData)
        );

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
        $this->assertResponseData(
            array_replace(self::data(3, true), $updatedData)
        );
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
    }

    public function testRestoreNotFound()
    {
        $this->client->put('/api/users/restore/999');
        $this->assertNotFound();
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
