<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits;

use Robert2\API\Controllers\Traits\WithModel;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

trait WithCrud
{
    use WithModel;

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(Request $request, Response $response): Response
    {
        $paginated = (bool)$request->getQueryParam('paginated', true);
        $searchTerm = $request->getQueryParam('search', null);
        $searchField = $request->getQueryParam('searchBy', null);
        $orderBy = $request->getQueryParam('orderBy', null);
        $limit = $request->getQueryParam('limit', null);
        $ascending = (bool)$request->getQueryParam('ascending', true);
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

        return $response->withJson($results);
    }

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = $this->getModelClass()::find($id);
        if (!$model) {
            throw new HttpNotFoundException($request);
        }

        return $response->withJson($model->toArray());
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    public function create(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        $result = $this->getModelClass()::new($postData);
        return $response->withJson($result->toArray(), SUCCESS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        $id = (int)$request->getAttribute('id');
        $model = $this->getModelClass()::find($id);
        if (!$model) {
            throw new HttpNotFoundException($request);
        }

        $result = $this->getModelClass()::staticEdit($id, $postData);
        return $response->withJson($result->toArray(), SUCCESS_OK);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = $this->getModelClass()::staticRemove($id);

        $data = $model ? $model->toArray() : ['destroyed' => true];
        return $response->withJson($data, SUCCESS_OK);
    }

    public function restore(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $data = $this->getModelClass()::staticUnremove($id);

        return $response->withJson($data, SUCCESS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Abstract methods
    // -
    // ------------------------------------------------------

    abstract protected function paginate(Request $request, $query, ?int $limit = null): array;
}
