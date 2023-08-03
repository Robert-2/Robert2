<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\WithCrud;
use Loxya\Http\Request;
use Loxya\Models\Tag;
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
