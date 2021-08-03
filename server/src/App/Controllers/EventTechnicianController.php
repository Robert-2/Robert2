<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Models\EventTechnician;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class EventTechnicianController extends BaseController
{
    use WithCrud;

    public function getAll(Request $request, Response $response): Response
    {
        throw new HttpNotFoundException($request);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = $request->getAttribute('id');
        EventTechnician::destroy($id);
        return $response->withJson(['destroyed' => true], SUCCESS_OK);
    }
}
