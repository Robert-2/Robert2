<?php
namespace Robert2\Tests;

final class SubCategoriesTest extends ApiTestCase
{
    public function testCreateSubCategoryNoCategoryId()
    {
        $this->client->post('/api/subcategories', ['name' => 'Fail SubCategory']);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertValidationErrorMessage();
        $this->assertErrorDetails([
            'category_id' => [
                "This field is mandatory",
                "This field must contain only numbers",
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
            'id' => 5,
            'name' => 'New SubCategory',
            'category_id' => 1,
            'created_at' => 'fakedTestContent',
            'updated_at' => 'fakedTestContent',
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
        $this->assertNotFound();
    }

    public function testUpdateSubCategory()
    {
        $this->client->put('/api/subcategories/1', ['name' => 'Mixers edited']);
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id' => 1,
            'name' => 'Mixers edited',
            'category_id' => 1,
            'created_at' => null,
            'updated_at' => 'fakedTestContent',
        ], ['updated_at']);
    }

    public function testDeleteSubCategory()
    {
        $this->client->delete('/api/subcategories/3');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['destroyed' => true]);

        $this->client->get('/api/subcategories/3');
        $this->assertNotFound();
    }
}
