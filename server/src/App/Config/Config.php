<?php
declare(strict_types=1);

namespace Loxya\Config;

use Loxya\Support\Arr;
use Loxya\Support\BaseUri;
use Monolog\Level as LogLevel;
use Psr\Http\Message\UriInterface;

final class Config
{
    private const FILE = CONFIG_FOLDER . DS . 'settings.json';

    /**
     * Configuration par défaut.
     *
     * Veuillez NE PAS modifier les valeurs dans ce fichier.
     * Utilisez le fichier `settings.json` pour surcharger les valeurs de certaines
     * des options ci-dessous, ou mieux encore, utilisez l'assistant d'installation.
     */
    public const DEFAULT_SETTINGS = [
        /**
         * L'URL de base de l'application.
         *
         * Si `null`, l'URL de base sera déduite, ce qui n'est absolument
         * pas sûr car cela ne prend pas en charge les installations dans
         * des sous-dossiers.
         */
        'baseUrl' => null,
        'apiHeaders' => ['Accept' => 'application/json'],
        'enableCORS' => false,
        'displayErrorDetails' => false,
        'useRouterCache' => true,
        'JWTSecret' => 'super_secret_key_you_should_not_commit',
        'httpAuthHeader' => 'Authorization',
        'sessionExpireHours' => 12,
        'maxItemsPerPage' => 100,
        /**
         * Nombre de requêtes simultanées maximum pour la
         * récupération du matériel manquant.
         */
        'maxConcurrentFetches' => 2,
        'defaultLang' => 'fr',
        'billingMode' => 'partial', // - Valeurs possibles : 'none', 'partial', 'all'.
        'degressiveRateFunction' => 'daysCount',
        'healthcheck' => false,
        'instanceId' => null,
        'proxy' => [
            'enabled' => false,
            'host' => 'proxy.loxya.test',
            'port' => 3128,
        ],
        'auth' => [
            'cookie' => 'auth',
        ],
        'currency' => [
            'symbol' => '€',
            'name' => 'Euro',
            'iso' => 'EUR',
        ],
        'db' => [
            'driver' => 'mysql',
            'host' => 'localhost',
            'port' => 3306,
            'database' => 'loxya',
            'username' => 'root',
            'password' => '',
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'options' => [
                \PDO::ATTR_CASE => \PDO::CASE_NATURAL,
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                \PDO::ATTR_STRINGIFY_FETCHES => false,
                \PDO::ATTR_EMULATE_PREPARES => true,
                \PDO::ATTR_PERSISTENT => true,
            ],
        ],
        'companyData' => [
            'name' => '',
            'logo' => null,
            'street' => '',
            'zipCode' => '',
            'locality' => '',
            'country' => '',
            'phone' => '',
            'email' => '',
            'legalNumbers' => [
                [
                    'name' => 'SIRET',
                    'value' => '',
                ],
                [
                    'name' => 'APE',
                    'value' => '',
                ],
            ],
            'vatNumber' => '',
            'vatRate' => 0.0,
        ],
        'logger' => [
            'timezone' => 'Europe/Paris',
            'level' => LogLevel::Notice,
            'max_files' => 10,
        ],
        'maxFileUploadSize' => 25 * 1024 * 1024, // - En octets
        'authorizedFileTypes' => [
            'application/pdf',
            'application/zip',
            'application/x-rar-compressed',
            'application/gzip',
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/svg+xml',
            'text/plain',
            'text/csv',
            'text/xml',
            'application/vnd.oasis.opendocument.spreadsheet',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.oasis.opendocument.text',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        'authorizedImageTypes' => [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/svg+xml',
        ],
        'email' => [
            'from' => '', // - Peut aussi être un tableau au format ['name' => '...', 'email' => '...']
            'driver' => 'mail', // - Valeurs possibles `mail`, `smtp`, `loxya`, ou `mailjet`. Default : `mail`.
            'smtp' => [
                'host' => 'localhost',
                'port' => 1025,
                'username' => null, // - Si `null`, l'authentification SMTP sera désactivée.
                'password' => null,
                'security' => '',
            ],
            'mailjet' => [
                'apiKey' => null,
                'apiSecretKey' => null,
            ],
        ],
        // - Couleurs personnalisées à utiliser dans le color-picker de l'application.
        //   (à la place des propositions par défaut, doit être un tableau avec des codes hexadécimaux ou `null`)
        'colorSwatches' => null,
    ];

    public const JSON_OPTIONS =
        JSON_PRETTY_PRINT |
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES;

    public const CUSTOM_SETTINGS = [
        'baseUrl' => 'string',
        'enableCORS' => 'bool',
        'displayErrorDetails' => 'bool',
        'useRouterCache' => 'bool',
        'JWTSecret' => 'string',
        'httpAuthHeader' => 'string',
        'sessionExpireHours' => 'int',
        'maxItemsPerPage' => 'int',
        'billingMode' => 'string',
        'degressiveRateFunction' => 'string',
        'defaultLang' => 'string',
        'currency' => 'array',
        'db?' => 'array',
        'companyData' => 'array',
    ];

    /** @var string|null La version de l'application, mise en "cache". */
    private static $versionCached;

    /**
     * @var array|null En environnement de test, plutôt que d'utiliser un
     *                 vrai fichier, cette variable sera utilisée pour stocker
     *                 la configuration.
     */
    private static $testConfig = null;

    /**
     * Permet de vérifier si une clé de configuration est définie.
     *
     * @param string $key La clé de configuration dont on souhaite vérifier l'existence.
     *                    Peut aussi contenir un chemin "dot-style" (e.g; `key.sub-key`)
     *                    pour vérifier les clés "profondes".
     *
     * @return bool Retourne `true` si la clé de configuration est définie, `false` sinon.
     */
    public static function has(string $key): bool
    {
        return Arr::has(self::get(), $key);
    }

    /**
     * Permet de récupérer la configuration complète ou bien la valeur d'une clé de configuration.
     *
     * NOTE: Préférez utiliser le settings du conteneur global lorsque vous le pouvez.
     *
     * @param ?string $key     La clé de configuration dont on souhaite récupérer la valeur.
     *                         Peut aussi contenir un chemin "dot-style" (e.g; `key.sub-key`)
     *                         pour récupérer les clés "profondes".
     * @param ?mixed  $default La valeur par défaut à retourner si la clé n'existe pas ou
     *                         contient la valeur `null`. Par défaut: `null`.
     *
     * @return mixed Si un chemin / une clé a été fournie: La valeur de la clé si elle est
     *               spécifier ou la valeur par défaut sinon. Si aucune clé n'a été fournie,
     *               tout la configuration sera retournée.
     */
    public static function get(?string $key = null, $default = null): mixed
    {
        $config = static::customConfigExists()
            ? static::retrieveCustomConfig()
            : static::DEFAULT_SETTINGS;

        return $key !== null
            ? (Arr::get($config, $key) ?? $default)
            : $config;
    }

    public static function getEnv(bool $envOnly = false)
    {
        $env = env('APP_ENV');
        if (!$envOnly && $env === null) {
            $env = static::get('env');
        }
        if (!in_array($env, ['development', 'production', 'test'], true)) {
            $env = 'production';
        }
        return $env;
    }

    public static function getVersion()
    {
        if (!static::$versionCached) {
            static::$versionCached = trim(file_get_contents(SRC_FOLDER . DS . 'VERSION'));
        }
        return static::$versionCached;
    }

    public static function getDbConfig(array $options = []): array
    {
        $options = array_merge(['noCharset' => false], $options);

        $dbConfig = self::get('db');

        // - Récupération des overwrites depuis les variables d'environnement.
        $envVars = [
            'host' => 'host',
            'port' => 'port',
            'name' => 'database',
            'test' => 'testDatabase',
            'user' => 'username',
            'pass' => 'password',
        ];
        foreach ($envVars as $envVar => $var) {
            $value = env(sprintf('DB_%s', strtoupper($envVar)));
            if ($value !== null) {
                $dbConfig[$var] = $value;
            }
        }

        // - Si on est dans un environnement de test, on utilise la base de test.
        if (static::getEnv() === 'test') {
            $dbConfig['testDatabase'] ??= sprintf('%s_test', $dbConfig['database']);
            $dbConfig['database'] = $dbConfig['testDatabase'];
        }

        $dbConfig['dsn'] = sprintf(
            '%s:host=%s;port=%s;dbname=%s',
            $dbConfig['driver'],
            $dbConfig['host'],
            $dbConfig['port'],
            $dbConfig['database'],
        );

        if (!$options['noCharset']) {
            $dbConfig['dsn'] .= sprintf(';charset=%s', $dbConfig['charset']);
        }

        return $dbConfig;
    }

    public static function getPDO(): \PDO
    {
        try {
            $dbConfig = self::getDbConfig();

            return new \PDO(
                $dbConfig['dsn'],
                $dbConfig['username'],
                $dbConfig['password'],
                $dbConfig['options'],
            );

        // @codeCoverageIgnoreStart
        } catch (\PDOException $e) {
            $details = match ($e->getCode()) {
                2002 => sprintf(
                    "Hostname `%s` unreachable. Please check DB `host` in configuration.",
                    $dbConfig['host'],
                ),
                1045 => "Bad credentials. Please check DB `username` and `password` in configuration.",
                1049 => sprintf(
                    "Database `%s` is missing. You should create it, or check its name in configuration.",
                    $dbConfig['database'],
                ),
                default => null,
            };

            $message = sprintf("Unable to connect to database (error %s)", $e->getCode());
            $message .= $details !== null
                ? sprintf(":\n    PDO details: %s", $e->getMessage())
                : sprintf(":\n    %s", $details);

            throw new \PDOException($message);
        }
        // @codeCoverageIgnoreEnd
    }

    /**
     * Permet de récupérer l'URL de base de l'application.
     *
     * @return string L'URL de base de l'application.
     */
    public static function getBaseUrl(): string
    {
        $url = self::get('baseUrl');

        // NOTE: Rétro-compatibilité, à supprimer à terme.
        if ($url === null && self::has('apiUrl')) {
            $url = self::get('apiUrl');
        }

        // - Dans le cas ou l'URL de base n'est pas définie, on tente
        //   de déduire ça de l'hôte courant.
        if ($url === null) {
            $scheme = env('HTTPS', false) ? 'https://' : 'http://';
            $host = env('HTTP_HOST') ?? 'localhost';
            $url = $scheme . $host;
        }

        return rtrim($url, '/');
    }

    /**
     * Permet de récupérer une instance de {@link UriInterface}
     * représentant l'URI de base de l'application.
     *
     * @return UriInterface L'URI de base de l'application.
     */
    public static function getBaseUri(): UriInterface
    {
        return new BaseUri(self::getBaseUrl());
    }

    // ------------------------------------------------------
    // -
    // -    Config storage related.
    // -
    // ------------------------------------------------------

    public static function customConfigExists(): bool
    {
        if (static::getEnv(true) === 'test') {
            return static::$testConfig !== null;
        }
        return file_exists(static::FILE);
    }

    public static function saveCustomConfig(array $customConfig): void
    {
        if (empty($customConfig)) {
            throw new \InvalidArgumentException("Empty configuration.");
        }

        foreach (self::CUSTOM_SETTINGS as $field => $type) {
            $isRequired = substr($field, -1) !== '?';
            $field = rtrim($field, '?');

            if (!array_key_exists($field, $customConfig)) {
                if ($isRequired) {
                    throw new \InvalidArgumentException(sprintf(
                        "Required configuration field `%s` is missing.",
                        $field,
                    ));
                }
                continue;
            }

            $functionTest = sprintf('is_%s', $type);
            if (!$functionTest($customConfig[$field])) {
                throw new \InvalidArgumentException(vsprintf(
                    "Configuration Field `%s` must be of type `%s`.",
                    [$field, $type],
                ));
            }
        }

        if (static::getEnv(true) === 'test') {
            static::$testConfig = $customConfig;
            return;
        }

        $jsonSettings = json_encode($customConfig, self::JSON_OPTIONS);
        $saved = file_put_contents(static::FILE, $jsonSettings);
        if (!$saved) {
            throw new \RuntimeException(
                "Unable to write JSON settings file. " .
                "Check write access to `config/` folder.",
            );
        }
    }

    public static function deleteCustomConfig(): void
    {
        if (static::getEnv(true) === 'test') {
            static::$testConfig = null;
            return;
        }

        if (file_exists(static::FILE)) {
            unlink(static::FILE);
        }
    }

    private static function retrieveCustomConfig(): array
    {
        if (!static::customConfigExists()) {
            throw new \RuntimeException('Config file is missing. Please create one.');
        }

        if (static::getEnv(true) !== 'test') {
            $fileContent = @file_get_contents(static::FILE);
            if ($fileContent === false) {
                throw new \RuntimeException('Unable to read the config file.');
            }

            $settings = json_decode($fileContent, true);
            if (!is_array($settings)) {
                throw new \RuntimeException('Config file cannot be decoded. It may be malformed or corrupted.');
            }
        } else {
            $settings = static::$testConfig;
        }

        return array_replace_recursive(self::DEFAULT_SETTINGS, $settings);
    }
}
