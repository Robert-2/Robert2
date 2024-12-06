<?php
declare(strict_types=1);

namespace Loxya\Controllers\Traits\Crud;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\WithModel;
use Loxya\Http\Request;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;

trait GetOne
{
    use WithModel;

    public function getOne(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');

        // @phpstan-ignore-next-line
        $entity = $this->getModelClass()::findOrFail($id);

        $data = method_exists(static::class, '_formatOne')
            ? static::_formatOne($entity)
            : $entity;

        return $response->withJson($data, StatusCode::STATUS_OK);
    }
}
