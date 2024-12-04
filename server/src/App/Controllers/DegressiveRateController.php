<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\Crud;
use Loxya\Errors\Exception\HttpConflictException;
use Loxya\Http\Request;
use Loxya\Models\DegressiveRate;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;

final class DegressiveRateController extends BaseController
{
    use Crud\Create;
    use Crud\Update;

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $countries = DegressiveRate::orderBy('id', 'asc')->get();
        return $response->withJson($countries, StatusCode::STATUS_OK);
    }

    public function delete(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');

        $degressiveRate = DegressiveRate::findOrFail($id);
        if ($degressiveRate->is_used || $degressiveRate->is_default) {
            throw new HttpConflictException($request, "The degressive rate cannot be deleted because it is in use.");
        }

        if (!$degressiveRate->delete()) {
            throw new \RuntimeException("An unknown error occurred while deleting the degressive rate.");
        }

        return $response->withStatus(StatusCode::STATUS_NO_CONTENT);
    }
}
