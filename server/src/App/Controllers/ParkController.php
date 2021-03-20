<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Middlewares\Auth;
use Robert2\API\Models\Park;
use Slim\Http\Request;
use Slim\Http\Response;

class ParkController extends BaseController
{
    /** @var Park */
    protected $model;

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getList(Request $request, Response $response): Response
    {
        $parks = $this->model->getAllForUser(Auth::user()->id)->select(['id', 'name']);
        $results = $parks->get()->each->setAppends([])->toArray();

        return $response->withJson($results);
    }
}
