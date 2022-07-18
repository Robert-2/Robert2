<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Models\Tag;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class TagController extends BaseController
{
    use WithCrud;

    public function getAll(Request $request, Response $response): Response
    {
        $onlyDeleted = (bool)$request->getQueryParam('deleted', false);

        $tags = Tag::withoutProtected()->orderBy('name');
        if ($onlyDeleted) {
            $tags->onlyTrashed();
        }
        return $response->withJson($tags->get());
    }

    public function getPersons(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $tag = Tag::find($id);
        if (!$tag) {
            throw new HttpNotFoundException($request);
        }

        $results = $this->paginate($request, $tag->Persons());
        return $response->withJson($results);
    }

    public function getMaterials(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $tag = Tag::find($id);
        if (!$tag) {
            throw new HttpNotFoundException($request);
        }

        $results = $this->paginate($request, $tag->Materials());
        return $response->withJson($results);
    }
}
