<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits\Crud;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\WithModel;
use Robert2\API\Http\Request;
use Slim\Http\Response;

trait GetOne
{
    use WithModel;

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');

        $model = $this->getModelClass()::findOrFail($id);
        if (method_exists(static::class, '_formatOne')) {
            $model = static::_formatOne($model);
        }

        return $response->withJson($model, StatusCode::STATUS_OK);
    }
}
