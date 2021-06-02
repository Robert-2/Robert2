<?php
namespace Robert2\Tests;

final class MaterialUnitStatesTest extends ApiTestCase
{
    public function testGetAll()
    {
        $this->client->get('/api/unit-states');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            [
                'id' => 1,
                'name' => 'Bon état',
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
            [
                'id' => 2,
                'name' => 'État médiocre',
                'created_at' => null,
                'updated_at' => null,
                'deleted_at' => null,
            ],
        ]);
    }

    public function testCreateBadData()
    {
        $this->client->post('/api/unit-states', ['name' => 'a']);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'name' => [
                "name must have a length between 2 and 64"
            ],
        ]);
    }

    public function testCreate()
    {
        $this->client->post('/api/unit-states', ['name' => 'Rayé']);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id' => 3,
            'name' => 'Rayé',
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
            'deleted_at' => null,
        ], ['created_at', 'updated_at']);
    }

    public function testUpdateBadData()
    {
        $this->client->put('/api/unit-states/1', ['name' => 'a']);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'name' => [
                "name must have a length between 2 and 64"
            ],
        ]);
    }

    public function testUpdate()
    {
        $this->client->put('/api/unit-states/2', ['name' => 'Médiocre']);
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 2,
            'name' => 'Médiocre',
            'created_at' => null,
            'updated_at' => 'fakedTestContent',
            'deleted_at' => null,
        ], ['updated_at']);
    }

    public function testDelete()
    {
        $this->client->delete('/api/unit-states/2');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['destroyed' => true]);
    }
}
