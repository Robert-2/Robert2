<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Models\Country;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class CountryController extends BaseController
{
    use WithCrud;

    public function getAll(Request $request, Response $response): Response
    {
        $data = (new Country())
            ->setOrderBy('id', true)
            ->getAll()
            ->get()
            ->toArray();

        return $response->withJson(compact('data'));
    }
}
