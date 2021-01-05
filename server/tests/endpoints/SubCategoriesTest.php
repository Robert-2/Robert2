<?php
namespace Robert2\Tests;

final class SubCategoriesTest extends ApiTestCase
{
    public function testCreateSubCategoryNoCategoryId()
    {
        $this->client->post('/api/subcategories', ['name' => 'Fail SubCategory']);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertErrorMessage("Validation failed. See error[details] for more informations.");
        $this->assertErrorDetails([
            'category_id' => [
                'category_id must not be empty',
                'category_id must be numeric',
            ]
        ]);
    }

    public function testCreateSubCategory()
    {
        $this->client->post('/api/subcategories', [
            'name'        => 'New SubCategory',
            'category_id' => 1,
        ]);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id'          => 5,
            'name'        => 'New SubCategory',
            'category_id' => 1,
            'created_at'  => 'fakedTestContent',
            'updated_at'  => 'fakedTestContent',
            'deleted_at'  => null,
        ], ['created_at', 'updated_at']);
    }

    public function testUpdateSubCategoryNoData()
    {
        $this->client->put('/api/subcategories/1', []);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertErrorMessage("Missing request data to process validation");
    }

    public function testUpdateSubCategoryNotFound()
    {
        $this->client->put('/api/subcategories/999', ['something' => '__inexistant__']);
        $this->assertStatusCode(ERROR_NOT_FOUND);
    }

    public function testUpdateSubCategory()
    {
        $this->client->put('/api/subcategories/1', ['name' => 'Mixers edited']);
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id'          => 1,
            'name'        => 'Mixers edited',
            'category_id' => 1,
            'created_at'  => null,
            'updated_at'  => 'fakedTestContent',
            'deleted_at'  => null
        ], ['updated_at']);
    }

    public function testDeleteAndDestroySubCategory()
    {
        // - First call : sets `deleted_at` not null
        $this->client->delete('/api/subcategories/3');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertNotEmpty($response['deleted_at']);

        // - Second call : actually DESTROY record from DB
        $this->client->delete('/api/subcategories/3');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['destroyed' => true]);
    }

    public function testRestoreSubCategoryNotFound()
    {
        $this->client->put('/api/subcategories/restore/999');
        $this->assertStatusCode(ERROR_NOT_FOUND);
    }

    public function testRestoreSubCategory()
    {
        // - First, delete category #3
        $this->client->delete('/api/subcategories/3');
        $this->assertStatusCode(SUCCESS_OK);

        // - Then, restore category #3
        $this->client->put('/api/subcategories/restore/3');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEmpty($response['deleted_at']);
    }
}
