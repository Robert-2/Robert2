<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Robert2\API\Models\Attribute;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class AttributeController extends BaseController
{
    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $attribute = Attribute::findOrFail($id)->append('categories');
        return $response->withJson($attribute->toArray());
    }

    public function getAll(Request $request, Response $response): Response
    {
        /** @var Builder $attributes */
        $attributes = Attribute::orderBy('name', 'asc');

        $categoryId = $request->getQueryParam('category', null);
        if (!empty($categoryId)) {
            $attributes->whereDoesntHave('categories');

            if ($categoryId !== 'none') {
                $attributes->orWhereHas('categories', function ($query) use ($categoryId) {
                    $query->where('categories.id', $categoryId);
                });
            }
        }

        $attributes = $attributes->with('categories');
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

        $attribute = $attribute->append('categories');
        return $response->withJson($attribute, SUCCESS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $rawData = (array)$request->getParsedBody();
        if (empty($rawData) || !is_array($rawData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        $id = (int)$request->getAttribute('id');
        $data = array_with_keys($rawData, ['name']);

        $attribute = Attribute::staticEdit($id, $data)
            ->append('categories');

        return $response->withJson($attribute);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        Attribute::staticRemove($id);
        return $response;
    }
}
