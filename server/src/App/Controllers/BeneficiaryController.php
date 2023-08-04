<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\WithCrud;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Http\Request;
use Loxya\Models\Enums\Group;
use Loxya\Models\Beneficiary;
use Loxya\Services\Auth;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;

class BeneficiaryController extends BaseController
{
    use WithCrud;

    public function getAll(Request $request, Response $response): Response
    {
        $paginated = (bool) $request->getQueryParam('paginated', true);
        $search = $request->getQueryParam('search', null);
        $limit = $request->getQueryParam('limit', null);
        $ascending = (bool) $request->getQueryParam('ascending', true);
        $onlyDeleted = (bool) $request->getQueryParam('deleted', false);

        $orderBy = $request->getQueryParam('orderBy', null);
        if (!in_array($orderBy, ['full_name', 'reference', 'company', 'email'], true)) {
            $orderBy = null;
        }

        $query = (new Beneficiary)
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

    public function create(Request $request, Response $response): Response
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $postData = Beneficiary::unserialize($postData);
        if (!Auth::is(Group::ADMIN)) {
            unset($postData['user']);
        }

        try {
            $beneficiary = Beneficiary::new($postData);
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
            if (empty($errors)) {
                throw $e;
            }

            $errors = Beneficiary::serializeValidation($errors);
            throw new ValidationException($errors);
        }

        $beneficiary = static::_formatOne($beneficiary);

        return $response->withJson($beneficiary, StatusCode::STATUS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        $postData = Beneficiary::unserialize($postData);
        if (!Auth::is(Group::ADMIN)) {
            unset($postData['user']);
        }

        try {
            $id = (int) $request->getAttribute('id');
            $beneficiary = Beneficiary::staticEdit($id, $postData);
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
            if (empty($errors)) {
                throw $e;
            }

            $errors = Beneficiary::serializeValidation($errors);
            throw new ValidationException($errors);
        }

        $beneficiary = static::_formatOne($beneficiary);

        return $response->withJson($beneficiary, StatusCode::STATUS_OK);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected static function _formatOne(Beneficiary $beneficiary): array
    {
        return $beneficiary->serialize(Beneficiary::SERIALIZE_DETAILS);
    }
}
