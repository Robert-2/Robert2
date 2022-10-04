<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits\Crud;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\WithModel;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

trait SoftDelete
{
    use WithModel;

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $this->getModelClass()::staticRemove($id);

        return $response->withStatus(StatusCode::STATUS_NO_CONTENT);
    }

    public function restore(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = $this->getModelClass()::staticUnremove($id);

        if (method_exists(static::class, '_formatOne')) {
            $model = static::_formatOne($model);
        }

        return $response->withJson($model, StatusCode::STATUS_OK);
    }
}
