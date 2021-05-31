<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Models\MaterialUnitState;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class MaterialUnitStateController extends BaseController
{
    use WithCrud;

    public function getAll(Request $request, Response $response): Response
    {
        $states = MaterialUnitState::get()->toArray();
        return $response->withJson($states, SUCCESS_OK);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $this->getModelClass()::staticRemove($id, ['force' => true]);

        $data = ['destroyed' => true];
        return $response->withJson($data, SUCCESS_OK);
    }
}
