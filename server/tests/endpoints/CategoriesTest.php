<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Collection;
use Loxya\Models\Category;
use Loxya\Support\Arr;

final class CategoriesTest extends ApiTestCase
{
    public static function data(?int $id = null, string $format = Category::SERIALIZE_DEFAULT)
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

        $categories = match ($format) {
            Category::SERIALIZE_DEFAULT => $categories->map(static fn ($category) => (
                Arr::except($category, ['sub_categories'])
            )),
            Category::SERIALIZE_DETAILS => $categories,
            default => throw new \InvalidArgumentException(sprintf("Unknown format \"%s\"", $format)),
        };

        return static::dataFactory($id, $categories->all());
    }

    public function testGetAll(): void
    {
        $this->client->get('/api/categories');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            self::data(4, Category::SERIALIZE_DETAILS),
            self::data(2, Category::SERIALIZE_DETAILS),
            self::data(1, Category::SERIALIZE_DETAILS),
            self::data(3, Category::SERIALIZE_DETAILS),
        ]);
    }

    public function testCreateWithoutData(): void
    {
        $this->client->post('/api/categories');
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testCreateBadData(): void
    {
        $this->client->post('/api/categories', [
            'name' => '',
        ]);
        $this->assertApiValidationError([
            'name' => ['This field is mandatory.'],
        ]);
    }

    public function testCreate(): void
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

    public function testUpdateNoData(): void
    {
        $this->client->put('/api/categories/1', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testUpdateCategoryNotFound(): void
    {
        $this->client->put('/api/categories/999', ['name' => '__inexistant__']);
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testUpdate(): void
    {
        $this->client->put('/api/categories/1', [
            'name' => 'Sound edited',
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace(
            self::data(1, Category::SERIALIZE_DETAILS),
            [
                'name' => 'Sound edited',
            ],
        ));
    }

    public function testDelete(): void
    {
        $this->client->delete('/api/categories/3');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);

        $this->client->get('/api/categories/3');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }
}
