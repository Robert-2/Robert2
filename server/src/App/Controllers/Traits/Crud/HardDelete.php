<?php
declare(strict_types=1);

namespace Loxya\Controllers\Traits\Crud;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\WithModel;
use Loxya\Http\Request;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;

trait HardDelete
{
    use WithModel;

    public function delete(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');

        // @phpstan-ignore-next-line
        $entity = $this->getModelClass()::findOrFail($id);

        if (!$entity->delete()) {
            throw new \RuntimeException("An unknown error occurred while deleting the entity.");
        }

        return $response->withStatus(StatusCode::STATUS_NO_CONTENT);
    }
}
