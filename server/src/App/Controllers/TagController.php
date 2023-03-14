<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Http\Request;
use Robert2\API\Models\Tag;
use Slim\Http\Response;

class TagController extends BaseController
{
    use WithCrud;

    public function getAll(Request $request, Response $response): Response
    {
        $onlyDeleted = (bool) $request->getQueryParam('deleted', false);

        $tags = Tag::orderBy('name');
        if ($onlyDeleted) {
            $tags->onlyTrashed();
        }
        return $response->withJson($tags->get(), StatusCode::STATUS_OK);
    }
}
