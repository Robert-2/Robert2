<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

final class SubCategoriesTest extends ApiTestCase
{
    public static function data(?int $id = null)
    {
        return static::dataFactory($id, [
            [
                'id' => 1,
                'name' => 'Mixeurs',
                'category_id' => 1,
            ],
            [
                'id' => 2,
                'name' => 'Processeurs',
                'category_id' => 1,
            ],
            [
                'id' => 3,
                'name' => 'Projecteurs',
                'category_id' => 2,
            ],
            [
                'id' => 4,
                'name' => 'Gradateurs',
                'category_id' => 2,
            ],
        ]);
    }

    public function testCreateSubCategoryNoCategoryId(): void
    {
        $this->client->post('/api/subcategories', ['name' => 'Fail SubCategory']);
        $this->assertApiValidationError([
            'category_id' => "This field is mandatory.",
        ]);
    }

    public function testCreateSubCategory(): void
    {
        $this->client->post('/api/subcategories', [
            'name' => 'New SubCategory',
            'category_id' => 1,
        ]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 5,
            'name' => 'New SubCategory',
            'category_id' => 1,
        ]);
    }

    public function testUpdateSubCategoryNoData(): void
    {
        $this->client->put('/api/subcategories/1', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testUpdateSubCategoryNotFound(): void
    {
        $this->client->put('/api/subcategories/999', [
            'something' => '__inexistant__',
        ]);
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testUpdateSubCategory(): void
    {
        $updatedData = [
            'name' => 'Mixers edited',
        ];
        $this->client->put('/api/subcategories/1', $updatedData);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(
            array_replace(self::data(1), $updatedData),
        );
    }

    public function testDeleteSubCategory(): void
    {
        $this->client->delete('/api/subcategories/3');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);

        $this->client->get('/api/subcategories/3');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }
}
