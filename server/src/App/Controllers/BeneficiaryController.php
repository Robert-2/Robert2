<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Errors\Exception\ValidationException;
use Robert2\API\Http\Request;
use Robert2\API\Models\Enums\Group;
use Robert2\API\Models\Beneficiary;
use Robert2\API\Services\Auth;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;

class BeneficiaryController extends BaseController
{
    use WithCrud;

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
