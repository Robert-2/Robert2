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
                'currentPage' => 1,
                'perPage' => $this->settings['maxItemsPerPage'],
                'total' => ['items' => 3, 'pages' => 1],
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
                        'full_address' => "1, somewhere av.\n1234 Megacity",
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
                        'full_address' => null,
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
                'full_address' => "1, somewhere av.\n1234 Megacity",
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
        ]);
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

    public function testCreateUserBadData()
    {
        $this->client->post('/api/users', [
            'email' => 'not-an-email',
            'person' => [
                'first_name' => '',
                'last_name' => '',
            ],
        ]);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'pseudo' => [
                "This field is mandatory",
            ],
            'email' => [
                "This email address is not valid",
            ],
            'group_id' => [
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
            'person' => [
                'first_name' => [
                    "This field is mandatory",
                    "This field contains some unauthorized characters",
                    "2 min. characters, 96 max. characters",
                ],
                'last_name' => [
                    "This field is mandatory",
                    "This field contains some unauthorized characters",
                    "2 min. characters, 96 max. characters",
                ],
            ],
        ]);
    }

    public function testCreateUserDuplicate()
    {
        $this->client->post('/api/users', [
            'pseudo' => 'test1',
            'email' => 'tester@robertmanager.net',
            'password' => 'test-dupe',
            'group_id' => 'member',
            'person' => [
                'first_name' => 'Nouveau',
                'last_name' => 'Testeur',
            ],
        ]);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'pseudo' => [
                "This pseudo is already in use",
            ],
            'email' => [
                "This email is already in use",
            ],
        ]);
    }

    public function testCreateUser()
    {
        $this->client->post('/api/users', [
            'email' => 'nobody@test.org',
            'pseudo' => 'Jeanne',
            'password' => 'my-ultim4te-paßwor!',
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
            'pseudo' => 'Jeanne',
            'group_id' => 'member',
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
                'full_address' => null,
                'company_id' => null,
                'note' => null,
                'deleted_at' => null,
                'company' => null,
                'country' => null,
            ],
        ], $response);
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
