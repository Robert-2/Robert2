<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Models\Attribute;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class AttributeController extends BaseController
{
    use WithCrud;

    public function getAll(Request $request, Response $response): Response
    {
        /** @var Builder $attributes */
        $attributes = Attribute::orderBy('name', 'asc');

        $categoryId = $request->getQueryParam('category', null);
        if (!empty($categoryId)) {
            $attributes
                ->whereDoesntHave('categories')
                ->orWhereHas('categories', function ($query) use ($categoryId) {
                    $query->where('categories.id', $categoryId);
                });
        }

        return $response->withJson($attributes->get());
    }

    public function create(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        $attribute = Attribute::new($postData);
        if (isset($postData['categories'])) {
            $attribute->Categories()->sync($postData['categories']);
        }

        return $response->withJson($attribute, SUCCESS_CREATED);
    }
}
