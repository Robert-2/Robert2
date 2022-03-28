<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Models\Country;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class CountryController extends BaseController
{
    public function getAll(Request $request, Response $response): Response
    {
        $data = (new Country())
            ->setOrderBy('id', true)
            ->getAll()
            ->get(['id', 'name', 'code']);

        return $response->withJson($data);
    }

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = Country::find($id);
        if (!$model) {
            throw new HttpNotFoundException($request);
        }
        return $response->withJson($model->toArray());
    }
}
