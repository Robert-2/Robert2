<?php
declare(strict_types=1);

namespace Loxya\Middlewares;

use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Loxya\Config;
use Loxya\Models\User;
use Loxya\Services\Auth;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Slim\Exception\HttpForbiddenException;
use Slim\Exception\HttpUnauthorizedException;
use Slim\Interfaces\RouteInterface;
use Slim\Routing\RouteContext;

final class Acl implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandler $handler): ResponseInterface
    {
        if (!($request instanceof \Loxya\Http\Request)) {
            throw new \InvalidArgumentException('Not a Loxya request.');
        }

        if ($request->isOptions()) {
            return $handler->handle($request);
        }

        if (!Auth::isAuthenticated()) {
            if (!$request->match(Config\Acl::PUBLIC_ROUTES)) {
                throw new HttpUnauthorizedException($request);
            }
        } else {
            $route = RouteContext::fromRequest($request)->getRoute();
            if (!$route || !static::isRouteAllowed(Auth::user(), $route)) {
                throw new HttpForbiddenException($request);
            }
        }

        return $handler->handle($request);
    }

    public static function isRouteAllowed(User $user, RouteInterface $route): bool
    {
        $allowList = Config\Acl::ALLOW_LIST[$user->group] ?? null;
        if (empty($allowList) || $allowList === '*') {
            return $allowList === '*';
        }

        $fqn = $route->getCallable();

        // - Si le callable n'est pas un FQN (= `[controller]:[action]`), on cherche à utiliser le nom
        //   pour la route dans les ACLs, toutes les routes doivent avoir soit un FQN, soit un nom,
        //   sinon elles ne peuvent pas être autorisées.
        if (!is_string($fqn)) {
            $name = $route->getName();
            if (empty($name)) {
                throw new \LogicException(
                    "All routes must either contain a callable in text form (= FQN) or contain a name.\n" .
                    "Otherwise, these routes will always be blocked by the ACL."
                );
            }
            return in_array($name, $allowList, true);
        }

        // - Sinon si le FQN est bien au format `[controller]:[action]`, on parse les composantes
        //   de celui-ci est on essai de trouver une valeur correspondante dans le tableau des ACLs.
        $callablePattern = '!^([^\:]+)Controller\:([a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)$!';
        if (!preg_match($callablePattern, $fqn, $matches)) {
            throw new \LogicException(
                "Unable to retrieve the Controller + Action from the route FQN.\n" .
                "Make sure you define the routes with the format `[Name]Controller:action`."
            );
        }
        [$controller, $action] = [class_basename($matches[1]), $matches[2] ?? '__invoke'];

        return (
            array_key_exists($controller, $allowList) &&
            in_array($action, $allowList[$controller], true)
        );
    }
}
