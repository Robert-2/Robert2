<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits\Crud;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Controllers\Traits\WithModel;
use Robert2\API\Http\Request;
use Slim\Http\Response;

trait HardDelete
{
    use WithModel;

    public function delete(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $entity = $this->getModelClass()::findOrFail($id);

        if (!$entity->delete()) {
            throw new \RuntimeException("An unknown error occurred while deleting the entity.");
        }

        return $response->withStatus(StatusCode::STATUS_NO_CONTENT);
    }
}
