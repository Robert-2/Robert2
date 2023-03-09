<?php
declare(strict_types=1);

namespace Robert2\API\Services;

use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Robert2\API\Config\Acl;
use Robert2\API\Config\Config;
use Robert2\API\Http\Request;
use Robert2\API\Models\User;
use Robert2\API\Services\Auth\AuthenticatorInterface;
use Slim\Exception\HttpUnauthorizedException;
use Slim\Psr7\Response;

final class Auth
{
    /** @var AuthenticatorInterface[] */
    private $authenticators;

    /** @var User|null */
    private static $user = null;

    /**
     * Constructeur.
     *
     * @param AuthenticatorInterface[] $authenticators
     */
    public function __construct(array $authenticators)
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

    public function logout(bool $full = true)
    {
        if (!static::isAuthenticated()) {
            return true;
        }

        // - Dispatch le logout aux authenticators.
        $hasLogoutSucceeded = true;
        foreach ($this->authenticators as $auth) {
            if (!$auth->logout($full)) {
                $hasLogoutSucceeded = false;
            }
        }

        // - Reset l'utilisateur connecté.
        static::reset();

        return $hasLogoutSucceeded;
    }

    // ------------------------------------------------------
    // -
    // -    Static public methods
    // -
    // ------------------------------------------------------

    public static function user(): ?User
    {
        if (empty(static::$user)) {
            return static::$user;
        }
        return static::$user->refresh();
    }

    public static function isAuthenticated(): bool
    {
        return (bool) static::user();
    }

    public static function is($groups): bool
    {
        $groups = (array) $groups;

        if (!static::isAuthenticated()) {
            return false;
        }

        return in_array(static::user()->group, (array) $groups, true);
    }

    public static function reset()
    {
        static::$user = null;
        container('i18n')->refreshLanguage();
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
        $isAllowedRoute = $request->match(Acl::PUBLIC_ROUTES);
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
        if (Config::getEnv() === 'test') {
            static::$user = User::find(1);

            // - L'utilisateur identifié a changé, on demande l'actualisation
            //   de la langue détecté par l'i18n car la valeur a pu changer...
            container('i18n')->refreshLanguage();

            return true;
        }

        // - On utilise les authenticators pour identifier l'utilisateur.
        foreach ($this->authenticators as $auth) {
            $user = $auth->getUser($request);
            if (!empty($user) && $user instanceof User) {
                static::$user = $user;

                // - L'utilisateur identifié a changé, on demande l'actualisation
                //   de la langue détecté par l'i18n car la valeur a pu changer...
                container('i18n')->refreshLanguage();

                return true;
            }
        }

        return false;
    }

    protected function unauthenticated(Request $request, RequestHandler $handler): Response
    {
        $isLoginRequest = $request->match(['/login', '/external/login']);
        if ($isLoginRequest) {
            return $handler->handle($request);
        }

        if (!$request->isXhr() && !$request->isApi()) {
            // TODO: globalConfig['client_url'] . '/login' à la place de '/login' ?
            $route = '/login';
            return (new Response(302))->withHeader('Location', $route);
        }

        throw new HttpUnauthorizedException($request);
    }
}
