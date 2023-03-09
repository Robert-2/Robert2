<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Http\Request;
use Robert2\API\Models\Material;
use Robert2\API\Models\Park;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;

class ParkController extends BaseController
{
    use WithCrud;

    public function getAll(Request $request, Response $response): Response
    {
        $paginated = (bool) $request->getQueryParam('paginated', true);
        $searchTerm = $request->getQueryParam('search', null);
        $searchField = $request->getQueryParam('searchBy', null);
        $orderBy = $request->getQueryParam('orderBy', null);
        $limit = $request->getQueryParam('limit', null);
        $ascending = (bool) $request->getQueryParam('ascending', true);
        $withDeleted = (bool) $request->getQueryParam('deleted', false);

        $query = $this->getModel()
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($searchTerm, $searchField)
            ->getAll($withDeleted);

        if ($paginated) {
            $results = $this->paginate($request, $query, is_numeric($limit) ? (int) $limit : null);
        } else {
            $results = $query->get();
        }

        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    public function getList(Request $request, Response $response): Response
    {
        $parks = Park::select(['id', 'name']);
        $results = $parks->get()->each->setAppends([])->toArray();

        return $response->withJson($results, StatusCode::STATUS_OK);
    }

    public function getOneMaterials(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        if (!Park::staticExists($id)) {
            throw new HttpNotFoundException($request);
        }

        $materials = Material::getParkAll($id);
        return $response->withJson($materials, StatusCode::STATUS_OK);
    }

    public function getOneTotalAmount(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $park = Park::withTrashed()->findOrFail($id)->append(['total_amount']);
        $result = ['id' => $id, 'totalAmount' => $park->total_amount];
        return $response->withJson($result, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    protected static function _formatOne(Park $park): Park
    {
        return $park->append([
            'has_ongoing_booking',
        ]);
    }
}
