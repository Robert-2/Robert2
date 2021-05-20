<?php
declare(strict_types=1);

namespace Robert2\API\Services\Auth;

use Monolog\Handler\RotatingFileHandler;
use Monolog\Logger;
use Ramsey\Uuid\Uuid;
use Robert2\API\Config\Config;
use Robert2\API\I18n\I18n;
use Robert2\API\Services\Auth;
use Robert2\API\Models\User;
use Slim\Http\ServerRequest as Request;
use \phpCAS;

final class CAS implements AuthenticatorInterface
{
    private $isAuthenticated = null;

    public function getUser(Request $request): ?User
    {
        $isCASEnabled = Config::getSettings('auth')['CAS']['enabled'];
        if (!$isCASEnabled) {
            return null;
        }

        // - Route stateless => Pas d'authentification stateful.
        if (Auth::isApiRequest($request)) {
            return null;
        }

        try {
            static::initializeCAS();

            if ($this->isAuthenticated()) {
                return static::authenticateUser();
            }
        } catch (\Throwable $e) {
            //-
        }

        return null;
    }

    public function logout(): bool
    {
        $isCASEnabled = Config::getSettings('auth')['CAS']['enabled'];
        if (!$isCASEnabled) {
            return true;
        }

        static::initializeCAS();

        if (!$this->isAuthenticated()) {
            return true;
        }

        try {
            phpCAS::logout();
        } catch (\Throwable $e) {
            return false;
        }

        return true;
    }

    public function isAuthenticated(): bool
    {
        if ($this->isAuthenticated === null) {
            try {
                $this->isAuthenticated = phpCAS::isAuthenticated();
            } catch (\Throwable $e) {
                return false;
            }
        }
        return $this->isAuthenticated;
    }

    // ------------------------------------------------------
    // -
    // -    Public methods
    // -
    // ------------------------------------------------------

    public static function initializeCAS()
    {
        if (phpCAS::isInitialized()) {
            return;
        }

        $config = Config::getSettings('auth')['CAS'];

        if (!$config['enabled']) {
            throw new \Exception("L'authentification CAS n'est pas activée.");
        }

        // - Logging
        $rotating = new RotatingFileHandler(VAR_FOLDER . DS . 'logs' . DS . 'auth' . DS . 'CAS', 0, Logger::DEBUG);
        phpCAS::setLogger((new Logger('CAS Auth'))->pushHandler($rotating));
        phpCAS::setVerbose(true);

        phpCAS::client(CAS_VERSION_3_0, $config['host'], $config['port'], '/cas');

        // - Patch l'URL de base qui n'est pas correctement définie par phpCAS lorsqu'on n'est pas en https.
        $scheme = $config['port'] == 443 ? 'https' : 'http';
        $baseUrl = sprintf('%s://%s', $scheme, $config['host']);
        if (!in_array($config['port'], [80, 443], true)) {
            $baseUrl .= sprintf(':%d', $config['port']);
        }
        phpCAS::getCasClient()->setBaseURL(sprintf('%s/cas/', $baseUrl));

        // - Language
        $languageMap = [
            'en' => PHPCAS_LANG_ENGLISH,
            'fr' => PHPCAS_LANG_FRENCH,
            'gr' => PHPCAS_LANG_GREEK,
            'de' => PHPCAS_LANG_GERMAN,
            'jp' => PHPCAS_LANG_JAPANESE,
            'es' => PHPCAS_LANG_SPANISH,
            'ca' => PHPCAS_LANG_CATALAN,
            'zh' => PHPCAS_LANG_CHINESE_SIMPLIFIED,
            'gl' => PHPCAS_LANG_GALEGO,
            'pt' => PHPCAS_LANG_PORTUGUESE,
        ];
        $locale = (new I18n())->getCurrentLocale();
        if (array_key_exists($locale, $languageMap)) {
            phpCAS::setLang($languageMap[$locale]);
        }

        // - Cert
        if ($config['cert'] !== false) {
            phpCAS::setCasServerCACert($config['cert']);
        } else {
            phpCAS::setNoCasServerValidation();
        }
    }

    public static function authenticateUser()
    {
        $identifier = phpCAS::getUser();
        $user = User::withCasIdentifier($identifier);
        if (!$user) {
            $attributes = phpCAS::getAttributes();
            $user = static::createCASUser($identifier, $attributes);
        }

        // - Enregistre le token JWT pour authentification stateless côté client.
        //   (et pour privilégier l'identification JWT lors du refresh plutôt que de passer par le serveur CAS)
        //   (*: cela nécessite que l'identification JWT intervienne AVANt l'identification CAS).
        JWT::registerToken($user, true);

        return $user;
    }

    public static function createCASUser(string $identifier, array $attributes): User
    {
        $config = Config::getSettings('auth')['CAS'];

        $attrsMap = [];
        if (!empty($config['attributes']) && is_array($config['attributes'])) {
            $attrsMap = $config['attributes'];
        }

        $getAttribute = function ($name) use ($attrsMap, $attributes) {
            if (empty($attrsMap[$name])) {
                return null;
            }

            foreach ((array)$attrsMap[$name] as $attr) {
                if (!empty($attributes[$attr])) {
                    return $attributes[$attr];
                }
            }

            return null;
        };

        // - Pseudo
        $pseudo = $getAttribute('pseudo') ?? $identifier;
        $pseudo = substr(alphanumericalize($pseudo), 0, 100);

        // - Mail
        $email = $getAttribute('email') ?? sprintf('%s@%s', $pseudo, $config['host']);

        // - Group
        $group = null;
        $casGroups = $getAttribute('group') ?? null;
        if (!empty($casGroups) || $casGroups === 0) {
            // TODO: Récupérer ça depuis la table des groupes ?
            // (Attention, il nous faut un ordre de priorité ascendant en valeur)
            $robertGroups = array_flip(['visitor', 'member', 'admin']);
            $group = array_reduce(
                is_array($casGroups) ? $casGroups : [$casGroups],
                function ($prevGroup, $casGroup) use ($robertGroups, $config) {
                    if (!array_key_exists($casGroup, $config['groupsMapping'])) {
                        return $prevGroup;
                    }

                    $currentGroup = $config['groupsMapping'][$casGroup];
                    if (!array_key_exists($currentGroup, $robertGroups)) {
                        throw new \RuntimeException(vsprintf(
                            "Le groupe de destination `%s` mappé pour `%s` n'existe pas, " .
                            "veuillez vérifier la configuration CAS.",
                            [$currentGroup, $casGroup]
                        ));
                        return $prevGroup;
                    }

                    if ($prevGroup !== null && $robertGroups[$prevGroup] >= $robertGroups[$currentGroup]) {
                        return $prevGroup;
                    }

                    return $currentGroup;
                },
                null
            );
        }

        return User::new([
            'pseudo' => $pseudo,
            'email' => $email,
            'group_id' => $group ?? 'visitor',
            'password' => Uuid::uuid4()->toString(),
            'cas_identifier' => $identifier,
        ]);
    }
}
