<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Services\Auth;
use Robert2\API\Models\Park;
use Slim\Http\ServerRequest as Request;
use Slim\Http\Response;

class ParkController extends BaseController
{
    use WithCrud;

    public function getList(Request $request, Response $response): Response
    {
        $parks = (new Park)->getAllForUser(Auth::user()->id)->select(['id', 'name']);
        $results = $parks->get()->each->setAppends([])->toArray();

        return $response->withJson($results);
    }
}
