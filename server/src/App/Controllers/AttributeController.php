<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\Builder;
use Robert2\API\Controllers\Traits\Crud;
use Robert2\API\Http\Request;
use Robert2\API\Models\Attribute;
use Slim\Http\Response;

class AttributeController extends BaseController
{
    use Crud\GetOne;
    use Crud\Create;
    use Crud\Update;
    use Crud\HardDelete;

    public function getAll(Request $request, Response $response): Response
    {
        /** @var Builder $attributes */
        $query = Attribute::orderBy('name', 'asc');

        $categoryId = $request->getQueryParam('category', null);
        if (!empty($categoryId)) {
            $query->whereDoesntHave('categories');

            if ($categoryId !== 'none') {
                $query->orWhereRelation('categories', 'categories.id', $categoryId);
            }
        }

        $attributes = $query
            ->with('categories')->get()
            ->each->append('categories');

        return $response->withJson($attributes, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected static function _formatOne(Attribute $attribute): Attribute
    {
        return $attribute->append('categories');
    }
}
