<?php
declare(strict_types=1);

namespace Loxya\Controllers\Traits\Crud;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\WithModel;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Http\Request;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;

trait Update
{
    use WithModel;

    public function update(Request $request, Response $response): Response
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        if (method_exists($this->getModelClass(), 'unserialize')) {
            $postData = $this->getModelClass()::unserialize($postData);
        }

        try {
            $id = (int) $request->getAttribute('id');
            $model = $this->getModelClass()::staticEdit($id, $postData);
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

        return $response->withJson($model, StatusCode::STATUS_OK);
    }
}
