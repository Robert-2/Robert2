<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\BaseController;
use Robert2\API\Controllers\Traits\WithPdf;
use Robert2\API\Models\Bill;
use Robert2\API\Services\Auth;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class BillController extends BaseController
{
    use WithPdf;

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');

        $model = Bill::find($id);
        if (!$model) {
            throw new HttpNotFoundException($request);
        }

        return $response->withJson($model->toArray());
    }

    public function create(Request $request, Response $response): Response
    {
        $eventId = (int)$request->getAttribute('eventId');
        $discountRate = (float)$request->getParsedBodyParam('discountRate');
        $result = (new Bill())->createFromEvent($eventId, Auth::user()->id, $discountRate);
        return $response->withJson($result->toArray(), SUCCESS_CREATED);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = Bill::staticRemove($id);

        $data = $model ? $model->toArray() : ['destroyed' => true];
        return $response->withJson($data, SUCCESS_OK);
    }
}
