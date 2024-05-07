<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Database\Eloquent\Builder;
use Loxya\Controllers\Traits\WithCrud;
use Loxya\Http\Request;
use Loxya\Models\Tag;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;

final class TagController extends BaseController
{
    use WithCrud;

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $onlyDeleted = $request->getBooleanQueryParam('deleted', false);

        $tags = Tag::query()
            ->when($onlyDeleted, static fn (Builder $subQuery) => (
                $subQuery->onlyTrashed()
            ))
            ->orderBy('name')
            ->get();

        return $response->withJson($tags, StatusCode::STATUS_OK);
    }
}
