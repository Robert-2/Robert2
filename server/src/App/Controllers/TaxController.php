<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\Crud;
use Loxya\Errors\Exception\HttpConflictException;
use Loxya\Http\Request;
use Loxya\Models\Tax;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;

final class TaxController extends BaseController
{
    use Crud\Create;
    use Crud\Update;

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $countries = Tax::orderBy('id', 'asc')->get();
        return $response->withJson($countries, StatusCode::STATUS_OK);
    }

    public function delete(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');

        $tax = Tax::findOrFail($id);
        if ($tax->is_used || $tax->is_default) {
            throw new HttpConflictException($request, "The tax cannot be deleted because it is in use.");
        }

        if (!$tax->delete()) {
            throw new \RuntimeException("An unknown error occurred while deleting the tax.");
        }

        return $response->withStatus(StatusCode::STATUS_NO_CONTENT);
    }
}
