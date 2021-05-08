<?php
namespace Robert2\Tests;

final class PersonsTest extends ApiTestCase
{
    public function testGetPersons()
    {
        $this->client->get('/api/persons');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'pagination' => [
                'current_page' => 1,
                'from' => 1,
                'last_page' => 1,
                'path' => '/api/persons',
                'first_page_url' => '/api/persons?page=1',
                'next_page_url' => null,
                'prev_page_url' => null,
                'last_page_url' => '/api/persons?page=1',
                'per_page' => $this->settings['maxItemsPerPage'],
                'to' => 3,
                'total' => 3,
            ],
            'data' => [
                [
                    'id' => 3,
                    'first_name' => 'Client',
                    'last_name' => 'Benef',
                    'full_name' => 'Client Benef',
                    'reference' => null,
                    'nickname' => null,
                    'email' => 'client@beneficiaires.com',
                    'phone' => '+33123456789',
                    'street' => '156 bis, avenue des tests poussés',
                    'postal_code' => '88080',
                    'locality' => 'Wazzaville',
                    'user_id' => null,
                    'country_id' => null,
                    'company_id' => null,
                    'note' => null,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                    'company' => null,
                    'country' => null,
                ],
                [
                    'id' => 1,
                    'first_name' => 'Jean',
                    'last_name' => 'Fountain',
                    'full_name' => 'Jean Fountain',
                    'reference' => '0001',
                    'nickname' => null,
                    'email' => 'tester@robertmanager.net',
                    'phone' => null,
                    'street' => "1, somewhere av.",
                    'postal_code' => '1234',
                    'locality' => "Megacity",
                    'user_id' => 1,
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
                [
                    'id' => 2,
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
                    'user_id' => 2,
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
        ]);

        $this->client->get('/api/persons?deleted=1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(0, '/api/persons', 'deleted=1');
    }

    public function testGetPersonsWithLimit()
    {
        $this->client->get('/api/persons?limit=2');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'pagination' => [
                'current_page' => 1,
                'from' => 1,
                'last_page' => 2,
                'path' => '/api/persons',
                'first_page_url' => '/api/persons?limit=2&page=1',
                'next_page_url' => '/api/persons?limit=2&page=2',
                'prev_page_url' => null,
                'last_page_url' => '/api/persons?limit=2&page=2',
                'per_page' => 2,
                'to' => 2,
                'total' => 3,
            ],
            'data' => [
                [
                    'id' => 3,
                    'first_name' => 'Client',
                    'last_name' => 'Benef',
                    'full_name' => 'Client Benef',
                    'reference' => null,
                    'nickname' => null,
                    'email' => 'client@beneficiaires.com',
                    'phone' => '+33123456789',
                    'street' => '156 bis, avenue des tests poussés',
                    'postal_code' => '88080',
                    'locality' => 'Wazzaville',
                    'user_id' => null,
                    'country_id' => null,
                    'company_id' => null,
                    'note' => null,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                    'company' => null,
                    'country' => null,
                ],
                [
                    'id' => 1,
                    'first_name' => 'Jean',
                    'last_name' => 'Fountain',
                    'full_name' => 'Jean Fountain',
                    'reference' => '0001',
                    'nickname' => null,
                    'email' => 'tester@robertmanager.net',
                    'phone' => null,
                    'street' => "1, somewhere av.",
                    'postal_code' => '1234',
                    'locality' => "Megacity",
                    'user_id' => 1,
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
        ]);

        $this->client->get('/api/persons?deleted=1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(0, '/api/persons', 'deleted=1');
    }

    public function testGetPersonNotFound()
    {
        $this->client->get('/api/persons/999');
        $this->assertNotFound();
    }

    public function testGetPerson()
    {
        $this->client->get('/api/persons/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'first_name' => 'Jean',
            'last_name' => 'Fountain',
            'full_name' => 'Jean Fountain',
            'reference' => '0001',
            'nickname' => null,
            'email' => 'tester@robertmanager.net',
            'phone' => null,
            'street' => "1, somewhere av.",
            'postal_code' => '1234',
            'locality' => "Megacity",
            'user_id' => 1,
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
        ]);
    }

    public function testGetTagsNotFound()
    {
        $this->client->get('/api/persons/999/tags');
        $this->assertNotFound();
    }

    public function testGetTags()
    {
        $this->client->get('/api/persons/2/tags');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            ['id' => 1, 'name' => 'tag 01'],
            ['id' => 2, 'name' => 'customers'],
        ]);
    }

    public function testGetPersonsByTagsNotFound()
    {
        $this->client->get('/api/persons?tags[0]=notFound');
        $this->assertStatusCode(SUCCESS_OK);
        $pagesUrl = '/api/persons?tags%5B0%5D=notFound&page=1';
        $this->assertResponseData([
            'pagination' => [
                'current_page' => 1,
                'from' => null,
                'last_page' => 1,
                'path' => '/api/persons',
                'first_page_url' => $pagesUrl,
                'next_page_url' => null,
                'prev_page_url' => null,
                'last_page_url' => $pagesUrl,
                'per_page' => $this->settings['maxItemsPerPage'],
                'to' => null,
                'total' => 0,
            ],
            'data' => [],
        ]);
    }

    public function testGetPersonsByTags()
    {
        $this->client->get('/api/persons?tags[0]=customers');
        $this->assertStatusCode(SUCCESS_OK);
        $pagesUrl = '/api/persons?tags%5B0%5D=customers&page=1';
        $this->assertResponseData([
            'pagination' => [
                'current_page' => 1,
                'from' => 1,
                'last_page' => 1,
                'path' => '/api/persons',
                'first_page_url' => $pagesUrl,
                'next_page_url' => null,
                'prev_page_url' => null,
                'last_page_url' => $pagesUrl,
                'per_page' => $this->settings['maxItemsPerPage'],
                'to' => 1,
                'total' => 1,
            ],
            'data' => [
                [
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
        ]);
    }

    public function testCreatePersonWithoutData()
    {
        $this->client->post('/api/persons');
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertErrorMessage("Missing request data to process validation");
    }

    public function testCreatePersonBadData()
    {
        $this->client->post('/api/persons', ['foo' => 'bar', 'email' => 'invalid']);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'first_name' => [
                "first_name must not be empty",
                'first_name must contain only letters (a-z) and ' .
                '""-_.\' ÇçàÀâÂäÄåÅèÈéÉêÊëËíÍìÌîÎïÏòÒóÓôÔöÖðÐõÕøØúÚùÙûÛüÜýÝÿŸŷŶøØæÆœŒñÑßÞ""',
                "first_name must have a length between 2 and 96"
            ],
            'last_name' => [
                "last_name must not be empty",
                'last_name must contain only letters (a-z) and ' .
                '""-_.\' ÇçàÀâÂäÄåÅèÈéÉêÊëËíÍìÌîÎïÏòÒóÓôÔöÖðÐõÕøØúÚùÙûÛüÜýÝÿŸŷŶøØæÆœŒñÑßÞ""',
                "last_name must have a length between 2 and 96"
            ],
            'email' => [
                "email must be valid email",
            ]
        ]);
    }

    public function testCreatePersonDuplicate()
    {
        $data = [
            'first_name' => 'Roger',
            'last_name' => 'Rabbit',
            'nickname' => 'Riri',
            'email' => 'tester2@robertmanager.net',
        ];
        $this->client->post('/api/persons', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id' => 2,
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
            'user_id' => 2,
            'country_id' => null,
            'company_id' => null,
            'note' => null,
            'created_at' => null,
            'updated_at' => null,
            'deleted_at' => null,
            'company' => null,
            'country' => null,
        ], ['created_at', 'updated_at']);
    }

    public function testCreatePerson()
    {
        $data = [
            'first_name' => 'Nanouk',
            'last_name' => 'Leskimo',
            'nickname' => 'Gniuk',
            'email' => 'tester3@robertmanager.net',
        ];
        $this->client->post('/api/persons', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id' => 4,
            'full_name' => 'Nanouk Leskimo',
            'company' => null,
            'country' => null,
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
        ] + $data, ['created_at', 'updated_at']);
    }

    public function testCreatePersonWithPhoneFail()
    {
        $data = [
            'first_name' => 'Tester',
            'last_name' => 'Tagger',
            'nickname' => 'Tagz',
            'email' => 'testerTag@robertmanager.net',
            'phone' => 'notAphoneNumber',
        ];
        $this->client->post('/api/persons', $data);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'phone' => [
                'phone must be a valid telephone number'
            ]
        ]);
    }

    public function testCreatePersonWithTagsAndPhone()
    {
        $data = [
            'first_name' => 'Tester',
            'last_name' => 'Tagger',
            'nickname' => 'Tagz',
            'email' => 'testerTag@robertmanager.net',
            'phone' => '0123456789',
            'tags' => ['FooTag', 'BarTag'],
        ];
        $this->client->post('/api/persons', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id' => 4,
            'first_name' => 'Tester',
            'last_name' => 'Tagger',
            'full_name' => 'Tester Tagger',
            'nickname' => 'Tagz',
            'email' => 'testerTag@robertmanager.net',
            'phone' => '0123456789',
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
            'company' => null,
            'country' => null,
        ], ['created_at', 'updated_at']);
    }

    public function testDeleteAndDestroyEvent()
    {
        // - First call : sets `deleted_at` not null
        $this->client->delete('/api/persons/2');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertNotEmpty($response['deleted_at']);

        // - Second call : actually DESTROY record from DB
        $this->client->delete('/api/persons/2');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['destroyed' => true]);
    }

    public function testRestorePersonNotFound()
    {
        $this->client->put('/api/persons/restore/999');
        $this->assertNotFound();
    }

    public function testRestoreEvent()
    {
        // - First, delete person #2
        $this->client->delete('/api/persons/2');
        $this->assertStatusCode(SUCCESS_OK);

        // - Then, restore person #2
        $this->client->put('/api/persons/restore/2');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEmpty($response['deleted_at']);
    }
}
