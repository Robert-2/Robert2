<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;

class AttributeController extends BaseController
{
    public function getAll(Request $request, Response $response): Response
    {
        $categoryId = $request->getQueryParam('category', null);

        $attributes = $this->model->orderBy('name', 'asc');
        if (!empty($categoryId)) {
            $attributes
                ->whereDoesntHave('categories')
                ->orWhereHas('categories', function ($query) use ($categoryId) {
                    $query->where('categories.id', $categoryId);
                });
        }

        $results = $attributes->with('categories')->get()->toArray();

        return $response->withJson($results);
    }

    public function create(Request $request, Response $response): Response
    {
        $postData = $request->getParsedBody();
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        $attribute = $this->model->edit(null, $postData);

        if (isset($postData['categories'])) {
            $attribute->Categories()->sync($postData['categories']);
        }

        $categories = $attribute->Categories()->get()->toArray();
        $result = $attribute->toArray() + compact('categories');

        return $response->withJson($result, SUCCESS_CREATED);
    }
}
