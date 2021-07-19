<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Models\Person;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class TechnicianController extends BaseController
{
    public function getEvents(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');

        try {
            $technician = Person::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            throw new HttpNotFoundException($request);
        }

        return $response->withJson($technician->events->toArray(), SUCCESS_OK);
    }
}
