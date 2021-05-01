<?php
declare(strict_types=1);

namespace Robert2\API\Middlewares;

use Robert2\API\Config;
use Robert2\API\Services\Auth;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Http\ServerRequest as Request;

class Acl
{
    public function __invoke(Request $request, RequestHandler $handler)
    {
        /** @var \Slim\Http\Response */
        $response = $handler->handle($request);

        if ($request->isOptions()) {
            return $response;
        }

        $currentRoute = $this->_getCurrentRoute($request);
        if (!preg_match('/^\/?api\//', $currentRoute)) {
            return $response;
        }

        $groupId = Auth::isAuthenticated() ? Auth::user()->group_id : 'visitor';
        $method = strtolower($request->getMethod());
        $deniedRoutes = $this->_getDeniedRoutes($groupId, $method);
        if (empty($deniedRoutes)) {
            return $response;
        }

        $currentRoute = preg_replace('/^\/api/', '', $currentRoute) . '[/]';
        if (in_array($currentRoute, $deniedRoutes)) {
            $oldResponse = $response->withStatus(ERROR_UNAUTHORIZED);
            return $oldResponse->withJson([
                'error' => "Unauthorized by ACL: users of group '$groupId' "
                . "are not allowed to access this API endpoint."
            ]);
        }

        return $response;
    }

    protected function _getCurrentRoute(Request $request): string
    {
        $currentRoute = $request->getUri()->getPath();
        $currentRoute = preg_replace('/[0-9]+/', '{id:[0-9]+}', $currentRoute);
        $currentRoute = preg_replace('/\/$/', '', $currentRoute);
        return $currentRoute;
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

        $routesByMethod = include __DIR__ . DS . 'Config' . DS . 'routes.php';
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
