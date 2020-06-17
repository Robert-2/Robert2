<?php
declare(strict_types=1);

namespace Robert2\API\Middlewares;

use Illuminate\Pagination\Paginator;
use Slim\Http\Request;
use Slim\Http\Response;

class Pagination
{
    public function __invoke(Request $request, Response $response, callable $next)
    {
        Paginator::currentPageResolver(
            function () use ($request) {
                return $request->getParam('page');
            }
        );

        return $next($request, $response);
    }
}
