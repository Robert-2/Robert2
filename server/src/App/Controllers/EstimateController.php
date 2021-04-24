<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithPdf;
use Robert2\API\Errors;
use Robert2\API\Services\Auth;
use Robert2\API\Models\Estimate;
use Slim\Http\Request;
use Slim\Http\Response;

class EstimateController
{
    use WithPdf;

    /** @var Estimate */
    protected $model;

    public function __construct()
    {
        $this->model = new Estimate();
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = $this->model->find($id);
        if (!$model) {
            throw new Errors\NotFoundException;
        }

        return $response->withJson($model->toArray());
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    public function create(Request $request, Response $response): Response
    {
        $eventId = (int)$request->getAttribute('eventId');
        $discountRate = (float)$request->getParsedBodyParam('discountRate');
        $result = $this->model->createFromEvent($eventId, Auth::user()->id, $discountRate);
        return $response->withJson($result->toArray(), SUCCESS_CREATED);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = $this->model->remove($id);

        $data = $model ? $model->toArray() : ['destroyed' => true];
        return $response->withJson($data, SUCCESS_OK);
    }
}
