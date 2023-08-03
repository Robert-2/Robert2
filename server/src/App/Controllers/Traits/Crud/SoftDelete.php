<?php
declare(strict_types=1);

namespace Loxya\Controllers\Traits\Crud;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\WithModel;
use Loxya\Http\Request;
use Slim\Http\Response;

trait SoftDelete
{
    use WithModel;

    public function delete(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $entity = $this->getModelClass()::withTrashed()->findOrFail($id);

        $isDeleted = $entity->trashed()
            ? $entity->forceDelete()
            : $entity->delete();

        if (!$isDeleted) {
            throw new \RuntimeException("An unknown error occurred while deleting the entity.");
        }

        return $response->withStatus(StatusCode::STATUS_NO_CONTENT);
    }

    public function restore(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $model = $this->getModelClass()::staticRestore($id);

        if (method_exists(static::class, '_formatOne')) {
            $model = static::_formatOne($model);
        }

        return $response->withJson($model, StatusCode::STATUS_OK);
    }
}
