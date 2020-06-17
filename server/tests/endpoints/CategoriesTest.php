<?php
namespace Robert2\Tests;

final class CategoriesTest extends ApiTestCase
{
    public function testGetCategories()
    {
        $this->client->get('/api/categories');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'pagination' => [
                'current_page'   => 1,
                'from'           => 1,
                'last_page'      => 1,
                'path'           => '/api/categories',
                'first_page_url' => '/api/categories?page=1',
                'next_page_url'  => null,
                'prev_page_url'  => null,
                'last_page_url'  => '/api/categories?page=1',
                'per_page'       => $this->settings['maxItemsPerPage'],
                'to'             => 3,
                'total'          => 3,
            ],
            'data' => [
                [
                    'id'             => 2,
                    'name'           => 'light',
                    'created_at'     => null,
                    'updated_at'     => null,
                    'deleted_at'     => null,
                    'sub_categories' => [
                        [
                            'id'          => 4,
                            'name'        => 'dimmers',
                            'category_id' => 2,
                        ],
                        [
                            'id'          => 3,
                            'name'        => 'projectors',
                            'category_id' => 2,
                        ],
                    ],
                ],
                [
                    'id'             => 1,
                    'name'           => 'sound',
                    'created_at'     => null,
                    'updated_at'     => null,
                    'deleted_at'     => null,
                    'sub_categories' => [
                        [
                            'id'          => 1,
                            'name'        => 'mixers',
                            'category_id' => 1,
                        ],
                        [
                            'id'          => 2,
                            'name'        => 'processors',
                            'category_id' => 1,
                        ],
                    ],
                ],
                [
                    'id'             => 3,
                    'name'           => 'transport',
                    'created_at'     => null,
                    'updated_at'     => null,
                    'deleted_at'     => null,
                    'sub_categories' => [],
                ],
            ],
        ]);

        $this->client->get('/api/categories?deleted=1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponsePaginatedData(0, '/api/categories', 'deleted=1');
    }

    public function testGetCategorieNotFound()
    {
        $this->client->get('/api/categories/999');
        $this->assertStatusCode(ERROR_NOT_FOUND);
        $this->assertNotFoundErrorMessage();
    }

    public function testGetCategory()
    {
        $this->client->get('/api/categories/1');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id'             => 1,
            'name'           => 'sound',
            'created_at'     => null,
            'updated_at'     => null,
            'deleted_at'     => null,
            'sub_categories' => [
                [
                    'id'          => 1,
                    'name'        => 'mixers',
                    'category_id' => 1,
                ],
                [
                    'id'          => 2,
                    'name'        => 'processors',
                    'category_id' => 1,
                ],
            ],
        ]);
    }

    public function testCreateCategory()
    {
        $this->client->post('/api/categories', ['name' => 'New Category']);
        $this->assertStatusCode(SUCCESS_CREATED);
        $this->assertResponseData([
            'id'             => 4,
            'name'           => 'New Category',
            'created_at'     => 'fakedTestContent',
            'updated_at'     => 'fakedTestContent',
            'sub_categories' => [],
        ], ['created_at', 'updated_at']);
    }

    public function testUpdateCategoryNoData()
    {
        $this->client->put('/api/categories/1', []);
        $this->assertStatusCode(ERROR_VALIDATION);
        $this->assertErrorMessage("Missing request data to process validation");
    }

    public function testUpdateCategoryNotFound()
    {
        $this->client->put('/api/categories/999', ['name' => '__inexistant__']);
        $this->assertStatusCode(ERROR_NOT_FOUND);
    }

    public function testUpdateCategory()
    {
        $this->client->put('/api/categories/1', ['name' => 'Sound edited']);
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData([
            'id'             => 1,
            'name'           => 'Sound edited',
            'created_at'     => null,
            'updated_at'     => 'fakedTestContent',
            'deleted_at'     => null,
            'sub_categories' => [
                [
                    'id'          => 1,
                    'name'        => 'mixers',
                    'category_id' => 1,
                ],
                [
                    'id'          => 2,
                    'name'        => 'processors',
                    'category_id' => 1,
                ],
            ],
        ], ['updated_at']);
    }

    public function testDeleteAndDestroyCategory()
    {
        // - First call : sets `deleted_at` not null
        $this->client->delete('/api/categories/3');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertNotEmpty($response['deleted_at']);

        // - Second call : actually DESTROY record from DB
        $this->client->delete('/api/categories/3');
        $this->assertStatusCode(SUCCESS_OK);
        $this->assertResponseData(['destroyed' => true]);
    }

    public function testRestoreCategoryNotFound()
    {
        $this->client->put('/api/categories/restore/999');
        $this->assertStatusCode(ERROR_NOT_FOUND);
    }

    public function testRestoreCategory()
    {
        // - First, delete category #3
        $this->client->delete('/api/categories/3');
        $this->assertStatusCode(SUCCESS_OK);

        // - Then, restore category #3
        $this->client->put('/api/categories/restore/3');
        $this->assertStatusCode(SUCCESS_OK);
        $response = $this->_getResponseAsArray();
        $this->assertEmpty($response['deleted_at']);
    }
}
