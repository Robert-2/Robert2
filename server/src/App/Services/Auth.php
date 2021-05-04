<?php
declare(strict_types=1);

namespace Robert2\API\Services;

use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Robert2\API\Config\Acl;
use Robert2\API\Models\User;
use Robert2\API\Services\Auth\AuthenticatorInterface;
use Slim\Exception\HttpUnauthorizedException;
use Slim\Http\ServerRequest as Request;
use Slim\Psr7\Response;

final class Auth
{
    /** @var AuthenticatorInterface[] */
    private $authenticators;

    /** @var User|null */
    private static $user = null;

    /**
     * Contructeur.
     *
     * @param AuthenticatorInterface[] $authenticators
     */
    public function __construct(array $authenticators = [])
    {
        $this->authenticators = $authenticators;
    }

    public function middleware(Request $request, RequestHandler $handler)
    {
        if (!$this->needsAuthentication($request)) {
            $this->retrieveUser($request);
            return $handler->handle($request);
        }

        if (!$this->retrieveUser($request)) {
            return $this->unauthenticated($request, $handler);
        }

        return $handler->handle($request);
    }

    public function logout()
    {
        if (!static::isAuthenticated()) {
            return true;
        }

        $isFullyLogout = true;
        foreach ($this->authenticators as $auth) {
            if (!$auth->logout()) {
                $isFullyLogout = false;
            }
        }

        return $isFullyLogout;
    }

    // ------------------------------------------------------
    // -
    // -    Static public methods
    // -
    // ------------------------------------------------------

    public static function user(): ?User
    {
        return !empty(static::$user) ? static::$user : null;
    }

    public static function isAuthenticated(): bool
    {
        return (bool)static::user();
    }

    public static function isLoginRequest(Request $request): bool
    {
        return static::requestMatch($request, '/login');
    }

    public static function isApiRequest(Request $request): bool
    {
        return static::requestMatch($request, '/api');
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    protected function needsAuthentication(Request $request): bool
    {
        // - HTTP Method: OPTIONS => On laisse passer.
        if ($request->isOptions()) {
            return false;
        }

        // - Routes publiques
        $isAllowedRoute = static::requestMatch($request, Acl::PUBLIC_ROUTES);
        if ($isAllowedRoute) {
            return false;
        }

        // - Toutes les autres routes sont protégées.
        return true;
    }

    protected function retrieveUser(Request $request): bool
    {
        if (static::user()) {
            return true;
        }

        // - Si on est en mode "test", on "fake" identifie l'utilisateur.
        if (isTestMode()) {
            static::$user = User::find(1);
            return true;
        }

        // - On utilise les authenticators pour identifier l'utilisateur.
        foreach ($this->authenticators as $auth) {
            $user = $auth->getUser($request);
            if (!empty($user) && $user instanceof User) {
                static::$user = $user;
                return true;
            }
        }

        return false;
    }

    protected function unauthenticated(Request $request, RequestHandler $handler): Response
    {
        if (static::isLoginRequest($request)) {
            return $handler->handle($request);
        }

        $isApiRequest = static::isApiRequest($request);
        $isNormalRequest = !$request->isXhr() && !$isApiRequest;
        if ($isNormalRequest) {
            // TODO: globalConfig['client_url'] . '/login' à la place de '/login' ?
            return (new Response(302))->withHeader('Location', '/login');
        }

        throw new HttpUnauthorizedException($request);
    }

    protected static function requestMatch(Request $request, $paths): bool
    {
        $method = $request->getMethod();
        $uri = '/' . $request->getUri()->getPath();
        $uri = preg_replace('#/+#', '/', $uri);

        foreach ((array)$paths as $path => $methods) {
            if (is_numeric($path)) {
                $path = $methods;
                $methods = null;
            }
            $path = rtrim($path, '/');

            $isUriMatching = preg_match(sprintf('@^%s(/.*)?$@', $path), $uri);
            $isMethodMatching = $methods === null || in_array($method, $methods, true);

            if ($isUriMatching && $isMethodMatching) {
                return true;
            }
        }

        return false;
    }
}
