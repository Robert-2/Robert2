<?php
declare(strict_types=1);

namespace Loxya\Controllers\Traits\Crud;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\WithModel;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Http\Request;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Http\Response;

trait Create
{
    use WithModel;

    public function create(Request $request, Response $response): ResponseInterface
    {
        $postData = (array) $request->getParsedBody();
        if (empty($postData)) {
            throw new HttpBadRequestException($request, "No data was provided.");
        }

        if (method_exists($this->getModelClass(), 'unserialize')) {
            // @phpstan-ignore-next-line
            $postData = $this->getModelClass()::unserialize($postData);
        }

        try {
            $model = $this->getModelClass()::new($postData);
        } catch (ValidationException $e) {
            $errors = $e->getValidationErrors();
            if (empty($errors) || !method_exists($this->getModelClass(), 'serializeValidation')) {
                throw $e;
            }

            // @phpstan-ignore-next-line
            $errors = $this->getModelClass()::serializeValidation($errors);
            throw new ValidationException($errors);
        }

        if (method_exists(static::class, '_formatOne')) {
            $model = static::_formatOne($model);
        }

        return $response->withJson($model, StatusCode::STATUS_CREATED);
    }
}
