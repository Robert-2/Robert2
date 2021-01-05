<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;

class CountryController extends BaseController
{
    public function getAll(Request $request, Response $response): Response
    {
        $data = $this->model
            ->setOrderBy('id', true)
            ->getAll()
            ->get()
            ->toArray();

        return $response->withJson(compact('data'));
    }
}
