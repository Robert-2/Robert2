<?php
declare(strict_types=1);

namespace Robert2\API\Middlewares;

use Robert2\API\Config;
use Robert2\API\Services\Auth;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Robert2\API\Models\Enums\Group;
use Slim\Exception\HttpUnauthorizedException;
use Slim\Http\ServerRequest as Request;

class Acl
{
    public function __invoke(Request $request, RequestHandler $handler)
    {
        if ($request->isOptions()) {
            return $handler->handle($request);
        }

        $currentRoute = $this->_getCurrentRoute($request);
        if (!preg_match('/^\/?api\//', $currentRoute)) {
            return $handler->handle($request);
        }

        $group = Auth::isAuthenticated()
            ? Auth::user()->group
            : Group::VISITOR;

        $method = strtolower($request->getMethod());
        $deniedRoutes = $this->_getDeniedRoutes($group, $method);
        if (empty($deniedRoutes)) {
            return $handler->handle($request);
        }

        $currentRoute = preg_replace('/^\/api/', '', $currentRoute) . '[/]';
        if (in_array($currentRoute, $deniedRoutes)) {
            throw new HttpUnauthorizedException($request);
        }

        return $handler->handle($request);
    }

    protected function _getCurrentRoute(Request $request): string
    {
        $currentRoute = $request->getUri()->getPath();
        $currentRoute = preg_replace('/[0-9]+/', '{id:[0-9]+}', $currentRoute);
        $currentRoute = preg_replace('/\/$/', '', $currentRoute);
        return $currentRoute;
    }

    protected function _getGroupDeny(string $group)
    {
        $denyList = Config\Acl::DENY_LIST;
        if (!isset($denyList[$group])) {
            throw new \OutOfBoundsException(sprintf("The group \"%s\" is unknown.", $group));
        }
        return $denyList[$group];
    }

    protected function _getDeniedRoutes(string $group, string $method): array
    {
        $groupDeny = $this->_getGroupDeny($group);
        if (empty($groupDeny)) {
            return [];
        }

        $routesByMethod = include CONFIG_FOLDER . DS . 'routes.php';
        if (!array_key_exists($method, $routesByMethod)) {
            return [];
        }

        $deniedRoutes = [];
        foreach ($routesByMethod[$method] as $route => $destination) {
            $destination = explode(':', $destination);
            $controller = preg_replace('/Controller$/', '', $destination[0]);

            if (!array_key_exists($controller, $groupDeny)) {
                continue;
            }

            $actionsDenied = $groupDeny[$controller];
            $action = $destination[1];

            if (in_array($action, $actionsDenied)) {
                $deniedRoutes[] = $route;
            }
        }

        return $deniedRoutes;
    }
}
