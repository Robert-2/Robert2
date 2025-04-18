<?php
declare(strict_types=1);

namespace Loxya\Services;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Collection;
use Loxya\Config\Acl;
use Loxya\Config\Config;
use Loxya\Http\Request;
use Loxya\Models\Enums\Group;
use Loxya\Models\User;
use Loxya\Services\Auth\Contracts\AuthenticatorInterface;
use Loxya\Services\Auth\Contracts\RemoteAuthenticatorInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Exception\HttpUnauthorizedException;
use Slim\Psr7\Response;

final class Auth
{
    /** @var Collection<array-key, AuthenticatorInterface> */
    private Collection $authenticators;

    private static ?User $user = null;

    /**
     * Constructeur.
     *
     * @param AuthenticatorInterface[] $authenticators
     */
    public function __construct(array $authenticators)
    {
        $this->authenticators = new Collection($authenticators);
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

    /**
     * Permet de déconnecter l'utilisateur courant.
     *
     * NOTE: Cette méthode ne devrait jamais être utilisée dans un contexte stateless.
     *
     * @param string|null $returnTo Si ce paramètre est spécifié, la déconnexion sera considérée comme
     *                              une déconnexion "complète" et la méthode retournera une réponse
     *                              {@link ResponseInterface} de redirection. La destination de cette
     *                              redirection dépendra de l'état de connexion de l'utilisateur sur
     *                              les systèmes de connexion distant activés.
     *                              Voir {@link RemoteAuthenticatorInterface::logout()} à ce sujet.
     *                              Quoi qu'il en soit, l'utilisateur sera, à la fin du processus de
     *                              déconnexion, redirigé vers l'URL spécifiée dans ce paramètre.
     *                              Si ce paramètre est passé à `null`, il n'y aura pas de redirection
     *                              de retournée et l'utilisateur sera uniquement déconnecté "localement"
     *                              (= sur Loxya).
     *
     * @return ?ResponseInterface Si c'est une déconnexion complète (voir `$returnTo` ci-dessus), une
     *                            réponse de type "redirection" sera retournée par cette méthode.
     *                            Sinon, `null` sera retourné.
     */
    public function logout(?string $returnTo): ?ResponseInterface
    {
        $isFullLogout = $returnTo !== null;

        if (!static::isAuthenticated()) {
            return $isFullLogout
                ? (new Response(StatusCode::STATUS_FOUND))
                    ->withHeader('Location', $returnTo)
                : null;
        }

        // - Récupère le premier authentifieur externe qui considère l'utilisateur
        //   comme authentifié via son système d'authentification distant.
        //
        // NOTE: S'il y en a plusieurs dans ce cas, malheureusement, seul le
        //       premier sera "complètement" déconnecté car on ne peut pas rediriger
        //       vers deux URLs en même temps (ce cas de figure étant assez rare étant
        //       donné qu'il faut qu'un utilisateur soit connecté sur plusieurs système
        //       distants en même temps et que Loxya en ait conscience).
        /** @var ?RemoteAuthenticatorInterface $remoteAuthenticator */
        $remoteAuthenticator = $isFullLogout
            ? $this->authenticators->first(static fn (AuthenticatorInterface $authenticator) => (
                $authenticator->isEnabled() &&
                $authenticator instanceof RemoteAuthenticatorInterface &&
                $authenticator->isAuthenticated()
            ))
            : null;

        // - Dispatch le logout aux authenticators.
        foreach ($this->authenticators as $auth) {
            if (!$auth->isEnabled()) {
                continue;
            }

            // - Si c'est une déconnexion "totale" et que c'est l'authentifieur
            //   externe qui a été choisi pour la déconnexion distante, on le
            //   passe car il sera déconnecté complètement plus bas.
            if ($isFullLogout && $auth === $remoteAuthenticator) {
                continue;
            }

            // - Sinon, on supprime les données d'authentification
            //   persistées localement.
            $auth->clearPersistentData();
        }

        // - Reset l'utilisateur connecté courant.
        static::reset();

        // - Si on a un authentifieur qui nécessite un logout avec redirection,
        //   on l'appelle maintenant que l'on a déconnecté localement les autres.
        if ($isFullLogout && $remoteAuthenticator !== null) {
            // - /!\ L'utilisateur va potentiellement être redirigé hors de Loxya !!!
            return $remoteAuthenticator->logout($returnTo);
        }

        return $isFullLogout
            ? (new Response(StatusCode::STATUS_FOUND))
                ->withHeader('Location', $returnTo)
            : null;
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes publiques statiques
    // -
    // ------------------------------------------------------

    public static function user(): ?User
    {
        return static::$user;
    }

    public static function isAuthenticated(): bool
    {
        return (bool) static::user();
    }

    public static function is($groups): bool
    {
        $groups = (array) $groups;

        if (!static::isAuthenticated()) {
            // - Si on est en mode CLI, on considère que le process
            //   courant a un accès administrateur.
            if (!isCli()) {
                return false;
            }
            $userGroup = Group::ADMINISTRATION;
        } else {
            $userGroup = static::user()->group;
        }

        return in_array($userGroup, (array) $groups, true);
    }

    public static function reset(): void
    {
        static::$user = null;
        container('i18n')->refreshLanguage();
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected function needsAuthentication(Request $request): bool
    {
        // - HTTP Method: OPTIONS => On laisse passer.
        if ($request->isOptions()) {
            return false;
        }

        // - Si ce n'est pas une route publique, c'est une route protégée.
        return !$request->match(Acl::PUBLIC_ROUTES);
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
            if (!$auth->isEnabled()) {
                continue;
            }

            $user = $auth->getUser($request);
            if (!empty($user) && $user instanceof User) {
                static::$user = $user;

                // - L'utilisateur identifié a changé, on demande l'actualisation
                //   de la langue détecté par l'i18n car la valeur a pu changer...
                container('i18n')->refreshLanguage();

                // - Si on est dans un contexte stateful, on persiste l'utilisateur pour que ceci puisse être connu du front-end.
                //   (sauf si c'est déjà l'authentification JWT qui a identifié l'utilisateur de manière stateful)
                if (!$request->isApi() && !($auth instanceof Auth\JWT)) {
                    Auth\JWT::registerSessionToken($user);
                }

                return true;
            }
        }

        return false;
    }

    protected function unauthenticated(Request $request, RequestHandler $handler): ResponseInterface
    {
        $isLoginRequest = $request->match(['/login']);
        if ($isLoginRequest) {
            return $handler->handle($request);
        }

        if (!$request->isXhr() && !$request->isApi()) {
            $url = (string) Config::getBaseUri()->withPath('/login');

            return (new Response(StatusCode::STATUS_FOUND))
                ->withHeader('Location', $url);
        }

        throw new HttpUnauthorizedException($request);
    }
}
