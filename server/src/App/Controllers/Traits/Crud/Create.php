<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits\Crud;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\WithModel;
use Robert2\API\Errors\ValidationException;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

trait Create
{
    use WithModel;

    public function create(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        if (method_exists($this->getModelClass(), 'unserialize')) {
            $postData = $this->getModelClass()::unserialize($postData);
        }

        try {
            $model = $this->getModelClass()::new($postData);
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
            if (empty($errors) || !method_exists($this->getModelClass(), 'serializeValidation')) {
                throw $e;
            }

            $errors = $this->getModelClass()::serializeValidation($errors);
            throw new ValidationException($errors);
        }

        if (method_exists(static::class, '_formatOne')) {
            $model = static::_formatOne($model);
        }

        return $response->withJson($model, StatusCode::STATUS_CREATED);
    }
}
