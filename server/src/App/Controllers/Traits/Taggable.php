<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits;

use Slim\Http\Request;
use Slim\Http\Response;

use Robert2\API\Errors;

trait Taggable
{
    public function getAll(Request $request, Response $response): Response
    {
        $searchTerm = $request->getQueryParam('search', null);
        $searchField = $request->getQueryParam('searchBy', null);
        $tags = $request->getQueryParam('tags', []);
        $orderBy = $request->getQueryParam('orderBy', null);
        $limit = $request->getQueryParam('limit', null);
        $ascending = (bool)$request->getQueryParam('ascending', true);
        $withDeleted = (bool)$request->getQueryParam('deleted', false);

        $results = $this->model
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($searchTerm, $searchField)
            ->getAllFilteredOrTagged([], $tags, $withDeleted)
            ->paginate($limit ? (int)$limit : $this->itemsCount);

        $basePath = $request->getUri()->getPath();
        $params   = $request->getQueryParams();
        $results  = $results->withPath($basePath)->appends($params);
        $results  = $this->_formatPagination($results);

        return $response->withJson($results);
    }

    public function getTags(Request $request, Response $response): Response
    {
        $id    = (int)$request->getAttribute('id');
        $model = $this->model->find($id);
        if (!$model) {
            throw new Errors\NotFoundException;
        }

        return $response->withJson($model->tags);
    }
}
