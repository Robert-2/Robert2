<?php
declare(strict_types=1);

namespace Loxya\Middlewares;

use Illuminate\Pagination\Paginator;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

final class Pagination implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandler $handler): ResponseInterface
    {
        if (!($request instanceof \Loxya\Http\Request)) {
            throw new \InvalidArgumentException('Not a Loxya request.');
        }

        Paginator::currentPageResolver(static fn () => (
            $request->getQueryParam('page')
        ));

        return $handler->handle($request);
    }
}
