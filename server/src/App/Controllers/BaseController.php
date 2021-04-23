<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;
use Robert2\API\Errors;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

abstract class BaseController
{
    protected $container;
    protected $model;
    protected $itemsCount;

    public function __construct($container)
    {
        if ($this->model === null) {
            $modelName = preg_replace('/Controller$/', '', class_basename($this));
            $modelFullName = sprintf('\\Robert2\\API\\Models\\%s', $modelName);
            if (class_exists($modelFullName, true)) {
                $this->model = new $modelFullName();
            }
        }

        $this->container  = $container;
        $this->itemsCount = $container->settings['maxItemsPerPage'];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(Request $request, Response $response): Response
    {
        $searchTerm = $request->getQueryParam('search', null);
        $searchField = $request->getQueryParam('searchBy', null);
        $orderBy = $request->getQueryParam('orderBy', null);
        $limit = $request->getQueryParam('limit', null);
        $ascending = (bool)$request->getQueryParam('ascending', true);
        $withDeleted = (bool)$request->getQueryParam('deleted', false);

        $results = $this->model
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($searchTerm, $searchField)
            ->getAll($withDeleted)
            ->paginate($limit ? (int)$limit : $this->itemsCount);

        $basePath = $request->getUri()->getPath();
        $params = $request->getQueryParams();
        $results = $results->withPath($basePath)->appends($params);
        $results = $this->_formatPagination($results);

        return $response->withJson($results);
    }

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = $this->model->find($id);
        if (!$model) {
            throw new Errors\NotFoundException;
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
        $postData = $request->getParsedBody();
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        $result = $this->model->edit(null, $postData);

        return $response->withJson($result->toArray(), SUCCESS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $postData = $request->getParsedBody();
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        $id = (int)$request->getAttribute('id');
        $model = $this->model->find($id);
        if (!$model) {
            throw new Errors\NotFoundException;
        }

        $result = $this->model->edit($id, $postData);

        return $response->withJson($result->toArray(), SUCCESS_OK);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = $this->model->remove($id);

        $data = $model ? $model->toArray() : ['destroyed' => true];
        return $response->withJson($data, SUCCESS_OK);
    }

    public function restore(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $data = $this->model->unremove($id);

        return $response->withJson($data, SUCCESS_OK);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Utility methods
    // —
    // ——————————————————————————————————————————————————————

    public function _formatPagination(Paginator $results): array
    {
        $result = $results->toArray();
        $data = $result['data'];

        unset(
            $result['data'],
            $result['links']
        );

        return [
            'pagination' => $result,
            'data'       => $data
        ];
    }
}
