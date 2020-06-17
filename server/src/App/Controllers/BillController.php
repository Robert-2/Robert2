<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;

use Robert2\API\Errors;
use Robert2\API\Models\Bill;
use Robert2\API\Controllers\Traits\AuthUser;
use Robert2\API\Controllers\Traits\WithPdf;

class BillController
{
    use WithPdf;
    use AuthUser;

    protected $container;
    protected $model;

    protected $dataFolder = 'bills';

    public function __construct($container)
    {
        $this->container = $container;
        $this->model = new Bill();
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
        $authUserData = $this->_getAuthUserData($request);

        $discountRate = (float)$request->getParsedBodyParam('discountRate');

        $result = $this->model->createFromEvent($eventId, $authUserData['id'], $discountRate);

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
