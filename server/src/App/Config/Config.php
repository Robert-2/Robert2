<?php
declare(strict_types=1);

namespace Robert2\API\Config;

use Monolog\Logger;

define('USE_SSL', isset($_SERVER['HTTPS']) ? (bool) $_SERVER['HTTPS'] : false);
define('HOST_NAME', $_SERVER['HTTP_HOST'] ?? 'localhost');

class Config
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
        'apiUrl' => (USE_SSL ? 'https://' : 'http://') . HOST_NAME,
        'apiHeaders' => ['Accept' => 'application/json'],
        'enableCORS' => false,
        'displayErrorDetails' => false,
        'useRouterCache' => true,
        'useHTTPS' => USE_SSL,
        'JWTSecret' => 'super_secret_key_you_should_not_commit',
        'httpAuthHeader' => 'Authorization',
        'sessionExpireHours' => 12,
        'maxItemsPerPage' => 100,
        'defaultLang' => 'fr',
        'billingMode' => 'partial', // - Valeurs possibles : 'none', 'partial', 'all'.
        'degressiveRateFunction' => 'daysCount',
        'proxy' => [
            'enabled' => false,
            'host' => 'proxy.robert2.test',
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
            'level' => Logger::NOTICE,
            'max_files' => 10,
        ],
        'maxFileUploadSize' => 25 * 1024 * 1024, // - En octets
        'authorizedFileTypes' => [
            'application/pdf',
            'application/zip',
            'application/x-rar-compressed',
            'image/jpeg',
            'image/png',
            'image/webp',
            'text/plain',
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
        ],
    ];

    public const JSON_OPTIONS = JSON_PRETTY_PRINT |
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES;

    public const CUSTOM_SETTINGS = [
        'apiUrl' => 'string',
        'enableCORS' => 'bool',
        'displayErrorDetails' => 'bool',
        'useRouterCache' => 'bool',
        'useHTTPS' => 'bool',
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

    public static function getSettings(?string $setting = null)
    {
        $settings = static::customConfigExists()
            ? static::retrieveCustomConfig()
            : static::DEFAULT_SETTINGS;

        if (empty($setting)) {
            return $settings;
        }

        return $settings[$setting] ?? null;
    }

    public static function getEnv(bool $envOnly = false)
    {
        $env = env('APP_ENV');
        if (!$envOnly && $env === null) {
            $env = static::getSettings('env');
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

        $dbConfig = self::getSettings('db');

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
            $dbConfig['database']
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
                $dbConfig['options']
            );

        // @codeCoverageIgnoreStart
        } catch (\PDOException $e) {
            $details = match ($e->getCode()) {
                2002 => "Hostname '{$dbConfig['host']}' unreachable. Please check DB 'host' in config.",
                1045 => "Bad credentials. Please check DB 'username' and 'password' in config.",
                1049 => (
                    "Database '{$dbConfig['database']}' is missing. " .
                    "You should create it, or check its name in config."
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
            throw new \InvalidArgumentException("Custom config: empty data.");
        }

        foreach (self::CUSTOM_SETTINGS as $field => $type) {
            $isRequired = substr($field, -1) !== '?';
            $field = rtrim($field, '?');

            if (!array_key_exists($field, $customConfig)) {
                if ($isRequired) {
                    throw new \InvalidArgumentException(
                        "Custom config: Required field '$field' is missing."
                    );
                }
                continue;
            }

            $functionTest = sprintf('is_%s', $type);
            if (!$functionTest($customConfig[$field])) {
                throw new \InvalidArgumentException(
                    "Custom config: Field '$field' must be of type '$type'."
                );
            }
        }

        if (static::getEnv(true) === 'test') {
            static::$testConfig = $customConfig;
            return;
        }

        $jsonSettings = json_encode($customConfig, self::JSON_OPTIONS);
        $saved = file_put_contents(static::FILE, $jsonSettings);
        if (!$saved) {
            throw new \RuntimeException("Unable to write JSON settings file. Check write access to config folder.");
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
