<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Errors;
use Robert2\API\Models\Material;
use Robert2\API\Models\Park;
use Slim\Http\Request;
use Slim\Http\Response;

class ParkController extends BaseController
{
    public function __construct($container)
    {
        parent::__construct($container);

        $this->model = new Park();
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Model dedicated methods
    // —
    // ——————————————————————————————————————————————————————

    public function getMaterials(Request $request, Response $response)
    {
        $id = (int)$request->getAttribute('id');
        if (!$this->model->exists($id)) {
            throw new Errors\NotFoundException;
        }

        $Park = $this->model->find($id);
        $materials = $Park->Materials()->paginate($this->itemsCount);

        $basePath = $request->getUri()->getPath();
        $materials->withPath($basePath);

        $results = $this->_formatPagination($materials);
        $results['data'] = array_map([Material::class, 'format'], $results['data']);

        return $response->withJson($results);
    }
}
