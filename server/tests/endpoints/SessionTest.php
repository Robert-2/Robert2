<?php
namespace Robert2\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

final class TokenTest extends ApiTestCase
{
    public function testGetSelf()
    {
        // - Test auth with e-mail address
        $this->client->get('/api/session');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(
            array_merge(UsersTest::data(1, true), [
                'language' => 'en',
            ])
        );
    }

    public function testAuthWithoutData()
    {
        $this->client->post('/api/session');
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertErrorMessage("No data was provided.");
    }

    public function testAuthBadData()
    {
        $this->client->post('/api/session', [
            'identifier' => 'foo',
            'password' => '',
        ]);
        $this->assertValidationError([
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
        $expectedUserData = array_merge(UsersTest::data(1, true), [
            'language' => 'en',
            'token' => '__FAKE_TEST_PLACEHOLDER__',
        ]);

        // - Test auth with e-mail address
        $this->client->post('/api/session', [
            'identifier' => 'tester@robertmanager.net',
            'password' => 'testing-pw',
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData($expectedUserData, ['token']);

        // - Test auth with pseudo
        $this->client->post('/api/session', [
            'identifier' => 'test1',
            'password' => 'testing-pw',
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData($expectedUserData, ['token']);
    }
}
