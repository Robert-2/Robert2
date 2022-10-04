<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits\Crud;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\WithModel;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

trait GetAll
{
    use WithModel;

    public function getAll(Request $request, Response $response): Response
    {
        $paginated = (bool)$request->getQueryParam('paginated', true);
        $searchTerm = $request->getQueryParam('search', null);
        $searchField = $request->getQueryParam('searchBy', null);
        $orderBy = $request->getQueryParam('orderBy', null);
        $limit = $request->getQueryParam('limit', null);
        $ascending = (bool)$request->getQueryParam('ascending', true);

        // TODO: Uniquement si soft deletable.
        $withDeleted = (bool)$request->getQueryParam('deleted', false);

        $query = $this->getModel()
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($searchTerm, $searchField)
            ->getAll($withDeleted);

        if ($paginated) {
            $results = $this->paginate($request, $query, $limit ? (int)$limit : null);
        } else {
            $results = $query->get();
        }

        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Abstract methods
    // -
    // ------------------------------------------------------

    abstract protected function paginate(Request $request, $query, ?int $limit = null): array;
}
