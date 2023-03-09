<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\Crud;
use Robert2\API\Http\Request;
use Robert2\API\Models\Country;
use Slim\Http\Response;

class CountryController extends BaseController
{
    use Crud\GetOne;

    public function getAll(Request $request, Response $response): Response
    {
        $countries = (new Country())
            ->setOrderBy('id', true)
            ->getAll()
            ->get();

        return $response->withJson($countries, StatusCode::STATUS_OK);
    }
}
