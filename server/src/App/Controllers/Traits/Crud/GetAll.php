<?php
declare(strict_types=1);

namespace Loxya\Controllers\Traits\Crud;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\WithModel;
use Loxya\Http\Request;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;

trait GetAll
{
    use WithModel;

    public function getAll(Request $request, Response $response): ResponseInterface
    {
        $paginated = (bool) $request->getQueryParam('paginated', true);
        $search = $request->getQueryParam('search', null);
        $orderBy = $request->getQueryParam('orderBy', null);
        $limit = $request->getQueryParam('limit', null);
        $ascending = (bool) $request->getQueryParam('ascending', true);

        // TODO: Uniquement si soft deletable.
        $onlyDeleted = (bool) $request->getQueryParam('deleted', false);

        $query = $this->getModel()
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($search)
            ->getAll($onlyDeleted);

        if ($paginated) {
            $results = $this->paginate($request, $query, is_numeric($limit) ? (int) $limit : null);
        } else {
            $results = $query->get();
        }

        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes abstraites
    // -
    // ------------------------------------------------------

    abstract protected function paginate(Request $request, $query, ?int $limit = null): array;
}
