<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;

class ParkController extends BaseController
{
    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getList(Request $request, Response $response): Response
    {
        $userId = $this->_getAuthUserId($request);

        $parks = $this->model->getAllForUser($userId)->select(['id', 'name']);
        $results = $parks->get()->each->setAppends([])->toArray();

        return $response->withJson($results);
    }
}
