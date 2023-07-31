<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Collection;
use Loxya\Support\Arr;

final class CategoriesTest extends ApiTestCase
{
    public static function data(int $id, $details = false)
    {
        $categories = new Collection([
            [
                'id' => 1,
                'name' => 'Son',
                'sub_categories' => [
                    SubCategoriesTest::data(1),
                    SubCategoriesTest::data(2),
                ],
            ],
            [
                'id' => 2,
                'name' => 'Lumière',
                'sub_categories' => [
                    SubCategoriesTest::data(4),
                    SubCategoriesTest::data(3),
                ],
            ],
            [
                'id' => 3,
                'name' => 'Transport',
                'sub_categories' => [],
            ],
            [
                'id' => 4,
                'name' => 'Décors',
                'sub_categories' => [],
            ],
        ]);

        if (!$details) {
            $categories = $categories->map(fn($category) => (
                Arr::except($category, ['sub_categories'])
            ));
        }

        return static::_dataFactory($id, $categories->all());
    }

    public function testGetAll()
    {
        $this->client->get('/api/categories');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(4, true),
            self::data(2, true),
            self::data(1, true),
            self::data(3, true),
        ]);
    }

    public function testCreateWithoutData()
    {
        $this->client->post('/api/categories');
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testCreateBadData()
    {
        $this->client->post('/api/categories', [
            'name' => '',
        ]);
        $this->assertApiValidationError([
            'name' => ['This field is mandatory'],
        ]);
    }

    public function testCreate()
    {
        $this->client->post('/api/categories', [
            'name' => 'New Category',
        ]);

        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 5,
            'name' => 'New Category',
            'sub_categories' => [],
        ]);
    }

    public function testUpdateNoData()
    {
        $this->client->put('/api/categories/1', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testUpdateCategoryNotFound()
    {
        $this->client->put('/api/categories/999', ['name' => '__inexistant__']);
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testUpdate()
    {
        $updatedData = [
            'name' => 'Sound edited',
        ];
        $this->client->put('/api/categories/1', $updatedData);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(
            array_replace(self::data(1, true), $updatedData)
        );
    }

    public function testDelete()
    {
        $this->client->delete('/api/categories/3');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);

        $this->client->get('/api/categories/3');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }
}
