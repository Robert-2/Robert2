<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\Crud;
use Robert2\API\Controllers\Traits\WithPdf;
use Robert2\API\Models\Bill;
use Robert2\API\Services\Auth;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class BillController extends BaseController
{
    use WithPdf;
    use Crud\GetOne;
    use Crud\SoftDelete;

    public function create(Request $request, Response $response): Response
    {
        $eventId = (int)$request->getAttribute('eventId');
        $discountRate = (float)$request->getParsedBodyParam('discountRate');

        $bill = Bill::createFromEvent($eventId, Auth::user()->id, $discountRate);
        return $response->withJson($bill, StatusCode::STATUS_CREATED);
    }
}
