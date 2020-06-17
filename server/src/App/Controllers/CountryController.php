<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;

use Robert2\API\Models\Country;

class CountryController extends BaseController
{
    public function __construct($container)
    {
        parent::__construct($container);

        $this->model = new Country();
    }

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
