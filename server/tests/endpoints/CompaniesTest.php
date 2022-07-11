<?php
namespace Robert2\Tests;

final class CompaniesTest extends ApiTestCase
{
    public function testGetCompanies()
    {
        $this->client->get('/api/companies');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'pagination' => [
                'currentPage' => 1,
                'perPage' => $this->settings['maxItemsPerPage'],
                'total' => ['items' => 2, 'pages' => 1],
            ],
            'data' => [
                [
                    'id' => 2,
                    'legal_name' => 'Obscure',
                    'street' => null,
                    'postal_code' => null,
                    'locality' => null,
                    'country_id' => null,
                    'full_address' => null,
                    'phone' => null,
                    'note' => null,
                    'created_at' => null,
                    'updated_at' => null,
                    'deleted_at' => null,
                    'country' => null,
                ],
                [
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
            ],
        ]);

        $this->client->get('/api/companies?deleted=1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(0, '/api/companies', 'deleted=1');
    }

    public function testGetCompanyNotFound()
    {
        $this->client->get('/api/companies/999');
        $this->assertNotFound();
    }

    public function testGetCompany()
    {
        $this->client->get('/api/companies/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
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
        ]);
    }

    public function testGetCompanySearchByLegalName()
    {
        $this->client->get('/api/companies?search=testin');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'pagination' => [
                'currentPage' => 1,
                'perPage' => $this->settings['maxItemsPerPage'],
                'total' => ['items' => 1, 'pages' => 1],
            ],
            'data' => [
                [
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
            ],
        ]);
    }

    public function testGetPersonsNotFound()
    {
        $this->client->get('/api/companies/999/persons');
        $this->assertNotFound();
    }

    public function testGetPersons()
    {
        $this->client->get('/api/companies/1/persons');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(1, '/api/companies/1/persons');
    }

    public function testCreateCompanyWithoutData()
    {
        $this->client->post('/api/companies');
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertErrorMessage("Missing request data to process validation");
    }

    public function testCreateCompanyBadData()
    {
        $this->client->post('/api/companies', ['foo' => 'bar']);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'legal_name' => [
                "This field is mandatory",
            ]
        ]);
    }

    public function testCreateCompanyDuplicate()
    {
        $this->client->post('/api/companies', [
            'id' => null,
            'legal_name' => 'Testing, Inc',
        ]);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
    }

    public function testCreateCompany()
    {
        $data = [
            'legal_name'  => 'test company',
            'street'      => 'Somewhere street, 123',
            'postal_code' => '75000',
            'locality'    => 'Paris',
            'country_id'  => 1,
        ];
        $this->client->post('/api/companies', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id' => 3,
            'legal_name' => 'test company',
            'street' => 'Somewhere street, 123',
            'postal_code' => '75000',
            'locality' => 'Paris',
            'country_id' => 1,
            'full_address' => "Somewhere street, 123\n75000 Paris",
            'phone' => null,
            'note' => null,
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
            'deleted_at' => null,
            'country' => [
                'id' => 1,
                'name' => 'France',
                'code' => 'FR',
            ],
        ], ['created_at', 'updated_at']);
    }

    public function testCreateCompanyWithTagAndPhone()
    {
        $data = [
            'legal_name' => 'test company',
            'street' => 'Somewhere street, 123',
            'postal_code' => '75000',
            'locality' => 'Paris',
            'country_id' => 1,
            'phone' => '+00336 25 25 21 25',
            'tags' => ['Bénéficiaire'],
        ];
        $this->client->post('/api/companies', $data);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id' => 3,
            'legal_name' => 'test company',
            'street' => 'Somewhere street, 123',
            'postal_code' => '75000',
            'locality' => 'Paris',
            'country_id' => 1,
            'full_address' => "Somewhere street, 123\n75000 Paris",
            'phone' => '+0033625252125',
            'note' => null,
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
            'deleted_at' => null,
            'country' => [
                'id' => 1,
                'name' => 'France',
                'code' => 'FR',
            ],
        ], ['created_at', 'updated_at']);
    }

    public function testDeleteAndDestroyCompany()
    {
        // - First call : sets `deleted_at` not null
        $this->client->delete('/api/companies/2');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertNotEmpty($response['deleted_at']);

        // - Second call : actually DESTROY record from DB
        $this->client->delete('/api/companies/2');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['destroyed' => true]);
    }

    public function testRestoreCompanyNotFound()
    {
        $this->client->put('/api/companies/restore/999');
        $this->assertNotFound();
    }

    public function testRestoreCompany()
    {
        // - First, delete company #2
        $this->client->delete('/api/companies/2');
        $this->assertStatusCode(SUCCESS_OK);

        // - Then, restore company #2
        $this->client->put('/api/companies/restore/2');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEmpty($response['deleted_at']);
    }
}
