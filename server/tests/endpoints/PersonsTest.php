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
                'currentPage' => 1,
                'perPage' => $this->settings['maxItemsPerPage'],
                'total' => ['items' => 3, 'pages' => 1],
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
                    'full_address' => "156 bis, avenue des tests poussés\n88080 Wazzaville",
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
                'currentPage' => 1,
                'perPage' => 2,
                'total' => ['items' => 3, 'pages' => 2],
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
                    'full_address' => "156 bis, avenue des tests poussés\n88080 Wazzaville",
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
            ['id' => 1, 'name' => 'Technician'],
            ['id' => 2, 'name' => 'Beneficiary'],
        ]);
    }

    public function testGetPersonsByTagsNotFound()
    {
        $this->client->get('/api/persons?tags[0]=notFound');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'pagination' => [
                'currentPage' => 1,
                'perPage' => $this->settings['maxItemsPerPage'],
                'total' => ['items' => 0, 'pages' => 1],
            ],
            'data' => [],
        ]);
    }

    public function testGetPersonsByTags()
    {
        $this->client->get('/api/persons?tags[0]=Technician');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'pagination' => [
                'perPage' => $this->settings['maxItemsPerPage'],
                'currentPage' => 1,
                'total' => ['items' => 1, 'pages' => 1],
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
                "This field is mandatory",
                "This field contains some unauthorized characters",
                "2 min. characters, 96 max. characters",
            ],
            'last_name' => [
                "This field is mandatory",
                "This field contains some unauthorized characters",
                "2 min. characters, 96 max. characters",
            ],
            'email' => [
                "This email address is not valid",
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
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'email' => [
                "This email address is already in use",
            ]
        ]);
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
            'full_address' => null,
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
                'This telephone number is not valid'
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
            'full_address' => null,
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
