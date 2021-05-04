<?php
declare(strict_types=1);

namespace Robert2\API\Config;

use Illuminate\Database\Capsule\Manager as Capsule;

define('USE_SSL', isset($_SERVER['HTTPS']) ? (bool)$_SERVER['HTTPS'] : false);
define('HOST_NAME', isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost');

class Config
{
    /**
     * DEFAULT SETTINGS
     *
     * Please DO NOT modify them here.
     * Use the `settings.json` file to overwrite settings,
     * or even better, use the Installation Wizard.
     */
    const DEFAULT_SETTINGS = [
        'apiUrl' => (USE_SSL ? 'https://' : 'http://') . HOST_NAME,
        'apiHeaders' => ['Accept' => 'application/json'],
        'basename' => "Robert2",
        'enableCORS' => false,
        'displayErrorDetails' => false,
        'useRouterCache' => true,
        'useHTTPS' => USE_SSL,
        'JWTSecret' => 'super_secret_key_you_should_not_commit',
        'httpAuthHeader' => 'Authorization',
        'sessionExpireHours' => 12,
        'maxItemsPerPage' => 100,
        'defaultLang' => 'fr',
        'defaultTags' => [
            'beneficiary' => 'Bénéficiaire',
            'technician' => 'Technicien',
        ],
        'billingMode' => 'partial',
        'degressiveRateFunction' => '((daysCount - 1) * 0.75) + 1',
        'auth' => [
            'cookie' => 'auth',
        ],
        'currency' => [
          'symbol' => '€',
          'name' => 'Euro',
          'iso' => 'EUR',
          'symbol_intl' => '€',
          'decimal_digits' => 2,
          'rounding' => 0,
        ],
        'db' => [
            'driver' => 'mysql',
            'host' => 'localhost',
            'port' => 3306,
            'database' => 'robert2',
            'testDatabase' => 'robert2_test',
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
            'level' => 'debug',
            'max_files' => 10,
        ],
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
    ];

    public const SETTINGS_FILE = __DIR__ . '/settings.json';
    public const JSON_OPTIONS = JSON_PRETTY_PRINT |
        JSON_UNESCAPED_UNICODE |
        JSON_NUMERIC_CHECK |
        JSON_UNESCAPED_SLASHES;

    public const CUSTOM_SETTINGS = [
        'apiUrl' => 'string',
        'basename' => 'string',
        'enableCORS' => 'bool',
        'displayErrorDetails' => 'bool',
        'useRouterCache' => 'bool',
        'useHTTPS' => 'bool',
        'useHTTPS' => 'bool',
        'JWTSecret' => 'string',
        'httpAuthHeader' => 'string',
        'sessionExpireHours' => 'int',
        'maxItemsPerPage' => 'int',
        'billingMode' => 'string',
        'degressiveRateFunction' => 'string',
        'defaultLang' => 'string',
        'defaultTags' => 'array',
        'currency' => 'array',
        'db' => 'array',
        'companyData' => 'array',
    ];

    /** @var string|null La version de l'application, mise en "cache". */
    private static $versionCached;

    public static function getSettings(?string $setting = null)
    {
        $settings = self::DEFAULT_SETTINGS;
        if (self::customConfigExists()) {
            $settings = self::_readSettingsFile();
        }

        if (empty($setting)) {
            return $settings;
        }

        return $settings[$setting] ?? null;
    }

    public static function getEnv()
    {
        $env = $_ENV['APP_ENV'] ?? static::getSettings('env') ?? 'production';

        $availableEnvs = ['development', 'production', 'test'];
        if (empty($env) || !in_array($env, $availableEnvs)) {
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

        if (isTestMode()) {
            $dbConfig['database'] = $dbConfig['testDatabase'];
        }

        // - Récupération des overwrites depuis les variables d'environnement.
        $possibleEnvVars = ['port', 'host', 'name', 'user'];
        foreach ($possibleEnvVars as $var) {
            $value = getenv(sprintf('DB_%s', strtoupper($var)));
            if ($value !== false) {
                $dbConfig[$var] = $value;
            }
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

    public static function getCapsule(): Capsule
    {
        $capsule = new Capsule();
        $capsule->addConnection(self::getDbConfig());
        $capsule->bootEloquent();

        return $capsule;
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
            switch ($e->getCode()) {
                case 2002:
                    $message = "Hostname '{$dbConfig['host']}' unreachable. Please check DB 'host' in config.";
                    break;
                case 1045:
                    $message = "Bad credentials. Please check DB 'username' and 'password' in config.";
                    break;
                case 1049:
                    $message  = "Database '{$dbConfig['database']}' is missing. ";
                    $message .= "You should create it, or check its name in config.";
                    break;
                default:
                    $message = "";
                    break;
            }
            throw new \PDOException(sprintf(
                "Unable to connect to database (error %s):\n    %s\n    PDO details: %s",
                $e->getCode(),
                $message,
                $e->getMessage()
            ));
        }
        // @codeCoverageIgnoreEnd
    }

    public static function customConfigExists(): bool
    {
        return file_exists(self::SETTINGS_FILE);
    }

    /**
     * @codeCoverageIgnore
     */
    public static function saveCustomConfig(array $customConfig, bool $forceOverwrite = false): void
    {
        if (file_exists(self::SETTINGS_FILE) && !$forceOverwrite) {
            throw new \RuntimeException("Can't overwrite existing JSON settings file.");
        }

        self::_ValidateCustomConfigData($customConfig);

        $jsonSettings = json_encode($customConfig, self::JSON_OPTIONS);

        $saved = file_put_contents(self::SETTINGS_FILE, $jsonSettings);
        if (!$saved) {
            throw new \RuntimeException("Unable to write JSON settings file. Check write access to config folder.");
        }
    }

    /**
     * @codeCoverageIgnore
     */
    private static function _ValidateCustomConfigData(array $customConfig): void
    {
        if (empty($customConfig)) {
            throw new \InvalidArgumentException("Custom config: empty data.");
        }

        foreach (self::CUSTOM_SETTINGS as $requiredField => $fieldType) {
            if (!array_key_exists($requiredField, $customConfig)) {
                throw new \InvalidArgumentException(
                    "Custom config: Required field '$requiredField' is missing."
                );
            }

            $functionTest = sprintf('is_%s', $fieldType);
            if (!$functionTest($customConfig[$requiredField])) {
                throw new \InvalidArgumentException(
                    "Custom config: Field '$requiredField' must be of type '$fieldType'."
                );
            }
        }
    }

    /**
     * @codeCoverageIgnore
     */
    public static function deleteCustomConfig(): void
    {
        if (file_exists(self::SETTINGS_FILE)) {
            unlink(self::SETTINGS_FILE);
        }
    }

    /**
     * @codeCoverageIgnore
     */
    private static function _readSettingsFile(): array
    {
        if (!file_exists(self::SETTINGS_FILE)) {
            throw new \RuntimeException("JSON settings file is missing. Please create one.");
        }

        $fileContent = @file_get_contents(self::SETTINGS_FILE);
        if ($fileContent === false) {
            throw new \RuntimeException("Unable to read JSON settings file.");
        }

        $settings = json_decode($fileContent, true);
        if (!is_array($settings)) {
            throw new \RuntimeException("JSON settings file cannot be decoded. It may be malformed or corrupted.");
        }

        return array_replace_recursive(self::DEFAULT_SETTINGS, $settings);
    }
}
