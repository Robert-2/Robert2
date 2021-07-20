<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Config\Config;
use Robert2\API\Models\Person;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class TechnicianController extends BaseController
{
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
        $startDate = $request->getQueryParam('startDate', null);
        $endDate = $request->getQueryParam('endDate', null);

        $technicianTag = Config::getSettings('defaultTags')['technician'];

        $builder = (new Person())
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($searchTerm, $searchField)
            ->getAllFilteredOrTagged([], [$technicianTag], $withDeleted);

        if (!empty($startDate) && !empty($endDate)) {
            $builder = $builder->whereDoesntHave('events', function ($query) use ($startDate, $endDate) {
                $query->where([
                    ['start_time', '>=', $startDate],
                    ['end_time', '<=', $endDate],
                ]);
            });
        }

        $paginated = $this->paginate($request, $builder, $limit ? (int)$limit : null);
        return $response->withJson($paginated);
    }

    public function getEvents(Request $request, Response $response): Response
    {
        $id = $request->getAttribute('id');

        $technician = Person::findOrFail($id);

        return $response->withJson($technician->events, SUCCESS_OK);
    }
}
