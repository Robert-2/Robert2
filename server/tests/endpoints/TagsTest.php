<?php
namespace Robert2\Tests;

final class TagsTest extends ApiTestCase
{
    public function testGetTags()
    {
        $this->client->get('/api/tags');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            [
                'id' => 3,
                'name' => 'pro',
            ],
        ]);

        $this->client->get('/api/tags?deleted=1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([]);
    }

    public function testCreateTagWithoutData()
    {
        $this->client->post('/api/tags');
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertErrorMessage("Missing request data to process validation");
    }

    public function testCreateTagBadData()
    {
        $this->client->post('/api/tags', ['foo' => 'bar']);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'name' => [
                "This field is mandatory",
            ],
        ]);
    }

    public function testCreateTagDuplicate()
    {
        $this->client->post('/api/tags', ['name' => 'Beneficiary']);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
    }

    public function testCreateTag()
    {
        $this->client->post('/api/tags', ['name' => 'New tag']);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id'         => 4,
            'name'       => 'New tag',
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
            'deleted_at' => null,
        ], ['created_at', 'updated_at']);
    }

    public function testGetPersonsNotFound()
    {
        $this->client->get('/api/tags/999/persons');
        $this->assertNotFound();
    }

    public function testGetPersons()
    {
        $this->client->get('/api/tags/2/persons');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(1, '/api/tags/2/persons');
    }

    public function testGetMaterialsNotFound()
    {
        $this->client->get('/api/tags/999/materials');
        $this->assertNotFound();
    }

    public function testGetMaterials()
    {
        $this->client->get('/api/tags/3/materials');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(3, '/api/tags/3/materials');
    }

    public function testDeleteAndDestroyTag()
    {
        // - First call : sets `deleted_at` not null
        $this->client->delete('/api/tags/3');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertNotEmpty($response['deleted_at']);

        // - Second call : actually DESTROY record from DB
        $this->client->delete('/api/tags/3');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['destroyed' => true]);
    }

    public function testRestoreTagNotFound()
    {
        $this->client->put('/api/tags/restore/999');
        $this->assertNotFound();
    }

    public function testRestoreTag()
    {
        // - First, delete tag #3
        $this->client->delete('/api/tags/3');
        $this->assertStatusCode(SUCCESS_OK);

        // - Then, restore tag #3
        $this->client->put('/api/tags/restore/3');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertNotEmpty($response['id']);
    }
}
