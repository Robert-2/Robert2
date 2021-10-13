<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Models\ListTemplate;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class ListTemplateController extends BaseController
{
    use WithCrud;

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

        $query = (new ListTemplate)
            ->setOrderBy($orderBy, $ascending)
            ->setSearch($searchTerm, $searchField)
            ->getAll($withDeleted)
            ->forAll();

        $paginated = $this->paginate($request, $query, $limit ? (int)$limit : null);
        return $response->withJson($paginated);
    }

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');

        $listTemplate = ListTemplate::forOne()->findOrFail($id)->append(['materials']);
        return $response->withJson($listTemplate);
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
                "Aucune donnée à utiliser pour la création.",
                ERROR_VALIDATION
            );
        }

        $result = ListTemplate::new($postData);
        $listTemplate = $result->append(['materials']);

        return $response->withJson($listTemplate, SUCCESS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Aucune donnée à utiliser pour la modification.",
                ERROR_VALIDATION
            );
        }

        $id = (int)$request->getAttribute('id');

        $result = ListTemplate::staticEdit($id, $postData);
        $listTemplate = $result->append(['materials']);

        return $response->withJson($listTemplate, SUCCESS_OK);
    }
}
