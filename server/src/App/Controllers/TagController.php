<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Errors;
use Robert2\API\Models\Material;
use Robert2\API\Models\Tag;
use Slim\Http\Request;
use Slim\Http\Response;

class TagController extends BaseController
{
    public function __construct($container)
    {
        parent::__construct($container);

        $this->model = new Tag();
    }

    public function getPersons(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!$this->model->exists($id)) {
            throw new Errors\NotFoundException;
        }

        $Tag       = $this->model->find($id);
        $materials = $Tag->Persons()->paginate($this->itemsCount);

        $basePath = $request->getUri()->getPath();
        $materials->withPath($basePath);

        $results = $this->_formatPagination($materials);

        return $response->withJson($results);
    }

    public function getMaterials(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        if (!$this->model->exists($id)) {
            throw new Errors\NotFoundException;
        }

        $Tag       = $this->model->find($id);
        $materials = $Tag->Materials()->paginate($this->itemsCount);

        $basePath = $request->getUri()->getPath();
        $materials->withPath($basePath);

        $results = $this->_formatPagination($materials);
        return $response->withJson($results);
    }
}
