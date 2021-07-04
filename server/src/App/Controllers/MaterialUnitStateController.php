<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Models\MaterialUnitState;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class MaterialUnitStateController extends BaseController
{
    public function getAll(Request $request, Response $response): Response
    {
        $states = MaterialUnitState::orderBy('order', 'asc')->get();
        return $response->withJson($states, SUCCESS_OK);
    }
}
