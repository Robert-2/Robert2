<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;

use Robert2\API\Errors;
use Robert2\API\Models\Company;
use Robert2\API\Controllers\Traits\Taggable;

class CompanyController extends BaseController
{
    use Taggable;

    public function __construct($container)
    {
        parent::__construct($container);

        $this->model = new Company;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Model dedicated methods
    // —
    // ——————————————————————————————————————————————————————

    public function getPersons(Request $request, Response $response)
    {
        $id = (int)$request->getAttribute('id');
        if (!$this->model->exists($id)) {
            throw new Errors\NotFoundException;
        }

        $Company = $this->model->find($id);
        $persons = $Company->Persons()->paginate($this->itemsCount);

        $basePath = $request->getUri()->getPath();
        $persons->withPath($basePath);

        $results = $this->_formatPagination($persons);

        return $response->withJson($results);
    }
}
