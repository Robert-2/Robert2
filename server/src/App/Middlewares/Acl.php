<?php
declare(strict_types=1);

namespace Robert2\API\Middlewares;

use Slim\Http\Request;
use Slim\Http\Response;

use Robert2\API\ApiRouter;
use Robert2\API\Config;

class Acl
{
    public function __invoke(Request $request, Response $response, callable $next)
    {
        $currentRoute = $this->_getCurrentRoute($request);
        if (!$this->_isProtectedRoute($currentRoute)) {
            return $next($request, $response);
        }

        $groupId = $this->_getCurrentUserGroup($request, $currentRoute);
        $method = strtolower($request->getMethod());
        $deniedRoutes = $this->_getDeniedRoutes($groupId, $method);
        if (empty($deniedRoutes)) {
            return $next($request, $response);
        }

        $currentRoute = preg_replace('/^\/api/', '', $currentRoute) . '[/]';
        if (in_array($currentRoute, $deniedRoutes)) {
            $oldResponse = $response->withStatus(ERROR_UNAUTHORIZED);
            return $oldResponse->withJson([
                'error' => "Unauthorized by ACL: users of group '$groupId' "
                . "are not allowed to access this API endpoint."
            ]);
        }

        return $next($request, $response);
    }

    protected function _getCurrentRoute(Request $request): string
    {
        $currentRoute = $request->getUri()->getPath();
        $currentRoute = preg_replace('/[0-9]+/', '{id:[0-9]+}', $currentRoute);
        $currentRoute = preg_replace('/\/$/', '', $currentRoute);
        return $currentRoute;
    }

    protected function _isProtectedRoute(string $route): bool
    {
        if (!preg_match('/^\/?api\//', $route)) {
            return false;
        }

        return !in_array($route, Config\Acl::PUBLIC_ROUTES);
    }

    protected function _getCurrentUserGroup(Request $request, string $currentRoute): string
    {
        $tokenData = $request->getAttribute(Config\Config::getSettings('JWTAttributeName'));
        if (!$tokenData || !array_key_exists('user', $tokenData)) {
            throw new \RuntimeException("Missing current user from token data for route: " . $currentRoute);
        }

        return $tokenData['user']->group_id;
    }

    protected function _getGroupDeny(string $groupId)
    {
        $denyList = Config\Acl::DENY_LIST;
        if (!isset($denyList[$groupId])) {
            throw new \OutOfBoundsException("The group '$groupId' is unknown.");
        }
        return $denyList[$groupId];
    }

    protected function _getDeniedRoutes(string $groupId, string $method): array
    {
        $groupDeny = $this->_getGroupDeny($groupId);
        if (empty($groupDeny)) {
            return [];
        }

        $routesByMethod = (new ApiRouter())->getRoutes();
        if (!array_key_exists($method, $routesByMethod)) {
            return [];
        }

        $deniedRoutes = [];
        foreach ($routesByMethod[$method] as $route => $destination) {
            $destination = explode(':', $destination);
            $controller  = preg_replace('/Controller$/', '', $destination[0]);

            if (!array_key_exists($controller, $groupDeny)) {
                continue;
            }

            $actionsDenied = $groupDeny[$controller];
            $action        = $destination[1];

            if (in_array($action, $actionsDenied)) {
                $deniedRoutes[] = $route;
            }
        }

        return $deniedRoutes;
    }
}
