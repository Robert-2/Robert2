<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Models\Person;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class TechnicianController extends BaseController
{
    public function getEvents(Request $request, Response $response): Response
    {
        $id = $request->getAttribute('id');

        $technician = Person::findOrFail($id);

        return $response->withJson($technician->events, SUCCESS_OK);
    }
}
