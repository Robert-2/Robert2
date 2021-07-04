<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Models\Park;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class ParkController extends BaseController
{
    use WithCrud;

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');

        $park = Park::findOrFail($id)->append([
            'has_ongoing_event',
        ]);
        return $response->withJson($park);
    }

    public function getList(Request $request, Response $response): Response
    {
        $parks = Park::select(['id', 'name']);
        $results = $parks->get()->each->setAppends([])->toArray();

        return $response->withJson($results);
    }
}
