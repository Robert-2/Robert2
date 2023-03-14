<?php
declare(strict_types=1);

namespace Robert2\API\Middlewares;

use Illuminate\Pagination\Paginator;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Robert2\API\Http\Request;

class Pagination
{
    public function __invoke(Request $request, RequestHandler $handler)
    {
        Paginator::currentPageResolver(
            function () use ($request) {
                return $request->getParam('page');
            }
        );

        return $handler->handle($request);
    }
}
