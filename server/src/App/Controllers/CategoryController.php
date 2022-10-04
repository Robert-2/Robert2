<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\Crud;
use Robert2\API\Models\Category;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class CategoryController extends BaseController
{
    use Crud\Create;
    use Crud\Update;
    use Crud\HardDelete;

    public function getAll(Request $request, Response $response): Response
    {
        $categories = Category::orderBy('name', 'asc')
            ->with('subCategories')->get()
            ->each->append('sub_categories');

        return $response->withJson($categories, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    protected static function _formatOne(Category $category): Category
    {
        return $category->append('sub_categories');
    }
}
