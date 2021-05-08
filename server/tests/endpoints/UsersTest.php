<?php
namespace Robert2\Tests;

final class UsersTest extends ApiTestCase
{
    public function testGetUsers()
    {
        $this->client->get('/api/users');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'pagination' => [
                'current_page' => 1,
                'from' => 1,
                'last_page' => 1,
                'path' => '/api/users',
                'first_page_url' => '/api/users?page=1',
                'next_page_url' => null,
                'prev_page_url' => null,
                'last_page_url' => '/api/users?page=1',
                'per_page' => $this->settings['maxItemsPerPage'],
                'to' => 3,
                'total' => 3,
            ],
            'data' => [
                [
                    'id' => 3,
                    'pseudo' => 'nobody',
                    'email' => 'nobody@robertmanager.net',
                    'group_id' => 'member',
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                    'person' => null,
                ],
                [
                    'id' => 1,
                    'pseudo' => 'test1',
                    'email' => 'tester@robertmanager.net',
                    'group_id' => 'admin',
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
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
                ],
                [
                    'id' => 2,
                    'pseudo' => 'test2',
                    'email' => 'tester2@robertmanager.net',
                    'group_id' => 'member',
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                    'person' => [
                        'id' => 2,
                        'user_id' => 2,
                        'first_name' => 'Roger',
                        'last_name' => 'Rabbit',
                        'full_name' => 'Roger Rabbit',
                        'reference' => '0002',
                        'nickname' => 'Riri',
                        'email' => 'tester2@robertmanager.net',
                        'phone' => null,
                        'street' => null,
                        'postal_code' => null,
                        'locality' => null,
                        'country_id' => null,
                        'company_id' => null,
                        'note' => null,
                        'created_at' => null,
                        'updated_at' => null,
                        'deleted_at' => null,
                        'company' => null,
                        'country' => null,
                    ],
                ],
            ],
        ]);

        $this->client->get('/api/users?deleted=1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(0, '/api/users', 'deleted=1');
    }

    public function testGetUserNotFound()
    {
        $this->client->get('/api/users/9999');
        $this->assertNotFound();
    }

    public function testGetUser()
    {
        $this->client->get('/api/users/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'pseudo' => 'test1',
            'email' => 'tester@robertmanager.net',
            'group_id' => 'admin',
            'cas_identifier' => null,
            'created_at' => null,
            'updated_at' => null,
            'deleted_at' => null,
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
            'restricted_parks' => [],
        ]);

        // - Pour l'utilisateur #2, on vérifie que les restricted_parks sont correctement retournés
        $this->client->get('/api/users/2');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertTrue(array_key_exists('restricted_parks', $response));
        $this->assertEquals([2], $response['restricted_parks']);
    }

    public function testGetUserSettingsNotFound()
    {
        $this->client->get('/api/users/9999/settings');
        $this->assertNotFound();
    }

    public function testGetUserSettingsNoSettingFound()
    {
        $this->client->get('/api/users/3/settings');
        $this->assertNotFound();
    }

    public function testGetUserSettings()
    {
        $this->client->get('/api/users/1/settings');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'user_id' => 1,
            'language' => 'EN',
            'auth_token_validity_duration' => 12,
            'created_at' => null,
            'updated_at' => null,
        ]);
    }

    public function testSetUserSettingsNoData()
    {
        $this->client->put('/api/users/1/settings', []);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertErrorMessage("Missing request data to process validation");
    }

    public function testSetUserSettingsNoUser()
    {
        $this->client->put('/api/users/999/settings', ['language' => 'FR']);
        $this->assertNotFound();
    }

    public function testSetUserSettings()
    {
        $this->client->put('/api/users/1/settings', [
            'language' => 'FR',
            'auth_token_validity_duration' => 72,
        ]);
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals('FR', $response['language']);
        $this->assertEquals(72, $response['auth_token_validity_duration']);
    }

    public function testUserSignupBadData()
    {
        $this->client->post('/api/users/signup', [
            'email' => '',
            'person' => [
                'first_name' => '',
                'last_name' => '',
            ],
        ]);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'pseudo' => [
                "pseudo must not be empty",
                "pseudo must contain only letters (a-z), digits (0-9) and \"-\"",
                "pseudo must have a length between 4 and 100",
            ],
            'email' => [
                "email must not be empty",
                "email must be valid email",
                "email must have a length between 5 and 191",
            ],
            'group_id' => [
                "group_id must not be empty",
                "At least one of these rules must pass for group_id",
                'group_id must be equals "admin"',
                'group_id must be equals "member"',
                'group_id must be equals "visitor"',
            ],
            'password' => [
                "password must not be empty",
                "password must have a length between 4 and 191",
            ],
        ]);
    }

    public function testUserSignup()
    {
        $this->client->post('/api/users/signup', [
            'email' => 'nobody@test.org',
            'pseudo' => 'signupTest',
            'password' => 'signupTest',
            'group_id' => 'member',
            'person' => [
                'first_name' => 'Nobody',
                'last_name' => 'Testeur',
            ],
        ]);
        $this->assertStatusCode(SUCCESS_CREATED);
        $response = $this->_getResponseAsArray();
        unset($response['created_at']);
        unset($response['updated_at']);
        unset($response['deleted_at']);
        unset($response['person']['created_at']);
        unset($response['person']['updated_at']);
        $this->assertEquals([
            'id' => 4,
            'email' => 'nobody@test.org',
            'pseudo' => 'signupTest',
            'group_id' => 'member',
            'cas_identifier' => null,
            'person' => [
                'id' => 4,
                'first_name' => 'Nobody',
                'last_name' => 'Testeur',
                'full_name' => 'Nobody Testeur',
                'reference' => null,
                'user_id' => 4,
                'nickname' => null,
                'email' => null,
                'phone' => null,
                'street' => null,
                'postal_code' => null,
                'locality' => null,
                'country_id' => null,
                'company_id' => null,
                'note' => null,
                'deleted_at' => null,
                'company' => null,
                'country' => null,
            ],
        ], $response);
    }

    public function testCreateUser()
    {
        $this->client->post('/api/users/signup', [
            'pseudo' => 'New User',
            'email' => 'test@testing.org',
            'password' => 'test',
            'group_id' => 'member',
        ]);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id' => 4,
            'pseudo' => 'New User',
            'email' => 'test@testing.org',
            'group_id' => 'member',
            'cas_identifier' => null,
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
            'deleted_at' => null,
            'person' => null,
        ], ['created_at', 'updated_at']);
    }

    public function testUpdateCategoryNoData()
    {
        $this->client->put('/api/users/1', []);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertErrorMessage("Missing request data to process validation");
    }

    public function testUpdateUserNotFound()
    {
        $this->client->put('/api/users/999', ['pseudo' => '__inexistant__']);
        $this->assertNotFound();
    }

    public function testUpdateUser()
    {
        $this->client->put('/api/users/3', [
            'pseudo' => 'userEdited',
            'person' => [
                'first_name' => 'Edited',
                'last_name' => 'Tester',
            ],
        ]);
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEquals('userEdited', $response['pseudo']);
        $this->assertEquals(3, $response['person']['user_id']);
        $this->assertEquals('Edited', $response['person']['first_name']);
        $this->assertEquals('Tester', $response['person']['last_name']);
    }

    public function testDeleteAndDestroyUser()
    {
        // - First call : sets `deleted_at` not null
        $this->client->delete('/api/users/3');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertNotEmpty($response['deleted_at']);

        // - Second call : actually DESTROY record from DB
        $this->client->delete('/api/users/3');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['destroyed' => true]);
    }

    public function testRestoreUserNotFound()
    {
        $this->client->put('/api/users/restore/999');
        $this->assertNotFound();
    }

    public function testRestoreUser()
    {
        // - First, delete user #2
        $this->client->delete('/api/users/2');
        $this->assertStatusCode(SUCCESS_OK);

        // - Then, restore user #2
        $this->client->put('/api/users/restore/2');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEmpty($response['deleted_at']);
    }
}
