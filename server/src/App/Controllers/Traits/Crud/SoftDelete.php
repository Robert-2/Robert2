<?php
declare(strict_types=1);

namespace Loxya\Controllers\Traits\Crud;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\WithModel;
use Loxya\Http\Request;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;

trait SoftDelete
{
    use WithModel;

    public function delete(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');

        // @phpstan-ignore-next-line
        $entity = $this->getModelClass()::withTrashed()->findOrFail($id);

        $isDeleted = $entity->trashed()
            ? $entity->forceDelete()
            : $entity->delete();

        if (!$isDeleted) {
            throw new \RuntimeException("An unknown error occurred while deleting the entity.");
        }

        return $response->withStatus(StatusCode::STATUS_NO_CONTENT);
    }

    public function restore(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');

        // @phpstan-ignore-next-line
        $entity = $this->getModelClass()::query()
            ->onlyTrashed()
            ->findOrFail($id);

        if (!$entity->restore()) {
            throw new \RuntimeException(sprintf("Unable to restore the record %d.", $id));
        }

        $data = method_exists(static::class, '_formatOne')
            ? static::_formatOne($entity)
            : $entity;

        return $response->withJson($data, StatusCode::STATUS_OK);
    }
}
