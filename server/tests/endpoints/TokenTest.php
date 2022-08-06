<?php
namespace Robert2\Tests;

use Robert2\API\Models\Enums\Group;

final class TokenTest extends ApiTestCase
{
    public function testAuthWithoutData()
    {
        $this->client->post('/api/session');
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();$this->assertErrorDetails([
            'identifier' => [
                "Identifier must not be empty",
            ],
            'password' => [
                "Password must not be empty",
            ],
        ]);
    }

    public function testAuthBadData()
    {
        $this->client->post('/api/session', [
            'identifier' => 'foo',
            'password' => '',
        ]);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'identifier' => [],
            'password' => [
                "Password must not be empty",
                "Password must have a length greater than 4",
            ],
        ]);
    }

    public function testTokenInexistantUser()
    {
        $this->client->post('/api/session', [
            'identifier' => 'nobody@test.org',
            'password' => 'testing',
        ]);
        $this->assertNotFound();
    }

    public function testTokenWrongPassword()
    {
        $this->client->post('/api/session', [
            'identifier' => 'tester@robertmanager.net',
            'password' => 'wrongPassword',
        ]);
        $this->assertNotFound();
    }

    public function testTokenAuthOK()
    {
        $expectedUserData = [
            'id' => 1,
            'email' => 'tester@robertmanager.net',
            'pseudo' => 'test1',
            'group' => Group::ADMIN,
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
            'settings' => [
                'id' => 1,
                'user_id' => 1,
                'language' => 'EN',
                'auth_token_validity_duration' => 12,
                'created_at' => null,
                'updated_at' => null
            ],
        ];

        // - Test auth with e-mail address
        $this->client->post('/api/session', [
            'identifier' => 'tester@robertmanager.net',
            'password' => 'testing-pw',
        ]);
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'token' => 'fakedTestContent',
            'user' => $expectedUserData,
        ], ['token']);

        // - Test auth with pseudo
        $this->client->post('/api/session', [
            'identifier' => 'test1',
            'password' => 'testing-pw',
        ]);
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'token' => 'fakedTestContent',
            'user' => $expectedUserData,
        ], ['token']);
    }
}
