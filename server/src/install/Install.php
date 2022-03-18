<?php
declare(strict_types=1);

namespace Robert2\Install;

use Robert2\API\Config as Config;
use Robert2\API\Console\App as CliApp;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\StreamOutput;

class Install
{
    // See in SetupController for steps execution
    const INSTALL_STEPS = [
        'welcome',
        'coreSettings',
        'settings',
        'company',
        'database',
        'dbStructure',
        'adminUser',
        'categories',
        'end',
    ];

    const INSTALL_FILE = __DIR__ . '/progress.json';
    const DB_INIT_DATA_DIR = __DIR__ . '/data';

    const REQUIRED_EXTENSIONS = [
        'pcre',
        'PDO',
        'mbstring',
        'fileinfo',
        'json',
        'intl',
        'pdo_mysql',
    ];

    const VALUE_TYPES = [
        'enableCORS' => 'boolean',
        'displayErrorDetails' => 'boolean',
        'useRouterCache' => 'boolean',
        'useHTTPS' => 'boolean',
        'sessionExpireHours' => 'integer',
        'maxItemsPerPage' => 'integer',
        'vatRate' => 'float',
    ];

    public static function getInstallProgress(): array
    {
        $default = ['step' => 'welcome'];

        if (!file_exists(self::INSTALL_FILE)) {
            return $default;
        }

        $installProgress = json_decode(@file_get_contents(self::INSTALL_FILE), true);
        if (!is_array($installProgress)) {
            return $default;
        }

        return $installProgress;
    }

    public static function setInstallProgress(string $step, ?array $data = null): array
    {
        $installProgress = self::getInstallProgress();

        if ($data === null) {
            $installProgress['step'] = $step;
            $installProgress["config_$step"] = [];

            return self::_saveInstallProcess($installProgress);
        }

        foreach ($data as $key => $value) {
            $keyType = self::VALUE_TYPES[$key] ??  null;
            if ($keyType === 'boolean') {
                $data[$key] = (bool)$value;
            }
            if ($keyType === 'integer') {
                $data[$key] = (int)$value;
            }
            if ($keyType === 'float') {
                $data[$key] = (float)$value;
            }
        };

        $installProgress["config_$step"] = $data;
        $installProgress['step'] = self::getNextInstallStep($step);

        return self::_saveInstallProcess($installProgress);
    }

    public static function getNextInstallStep(string $step): string
    {
        if (!in_array($step, self::INSTALL_STEPS)) {
            return 'welcome';
        }

        $stepIndex = array_search($step, self::INSTALL_STEPS);

        if (isset(self::INSTALL_STEPS[$stepIndex + 1])) {
            return self::INSTALL_STEPS[$stepIndex + 1];
        }

        return 'end';
    }

    public static function getSettingsFromInstallData(): array
    {
        $installData = self::getInstallProgress();
        $settings = array_merge(
            $installData['config_coreSettings'],
            $installData['config_settings']
        );
        $settings['db'] = $installData['config_database'];
        $settings['companyData'] = $installData['config_company'];

        return $settings;
    }

    public static function getMigrationsStatus(): array
    {
        $output = self::_executePhinxCommand('status');

        return self::_formatPhinxStatusOutput($output);
    }

    public static function createMissingTables(): array
    {
        return self::_executePhinxCommand('migrate');
    }

    public static function insertInitialDataIntoDB()
    {
        $initialDataSqlFile = sprintf('%s/initial.sql', self::DB_INIT_DATA_DIR);
        try {
            self::_executeSqlFile($initialDataSqlFile);
        } catch (\PDOException $e) {
            $details = $e->getMessage();
            if ($e->getCode() === '23000') {
                $subcode = explode(" ", explode(": ", $details)[2]);
                if ($subcode[0] === '1062') {
                    return;
                }
            }
            throw new \RuntimeException(sprintf(
                "Unable to insert initial data into database. Reason:\n%s",
                $e->getMessage()
            ));
        }

        $installData = self::getInstallProgress();
        if (empty($installData['config_settings'])) {
            return;
        }

        $prefix = Config\Config::getSettings('db')['prefix'];

        $requests = [];
        $now = date('Y-m-d H:i:s');
        foreach ($installData['config_settings']['defaultTags'] as $tagName) {
            $requests[] = sprintf(
                "INSERT IGNORE INTO `%1\$stags` (`name`, `created_at`, `updated_at`) " .
                "VALUES ('%2\$s', '%3\$s', '%3\$s')",
                $prefix,
                $tagName,
                $now
            );
        }

        $requests[] = sprintf(
            "UPDATE `%1\$sparks` SET " .
            "`name` = '%2\$s', `created_at` = '%3\$s', `updated_at` = '%3\$s' " .
            "WHERE `name` = 'default'",
            $prefix,
            $installData['config_settings']['defaultParkName'],
            $now
        );

        try {
            $pdo = Config\Config::getPDO();
            $pdo->query(implode(';', $requests));
        } catch (\PDOException $e) {
            throw new \RuntimeException(sprintf(
                "Unable to insert initial data into database. Reason:\n%s",
                $e->getMessage()
            ));
        }
    }

    public static function getAllCurrencies(): array
    {
        return require 'data/currencies.php';
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Private methods
    // —
    // ——————————————————————————————————————————————————————

    private static function _saveInstallProcess(array $installProgress): array
    {
        $jsonInstallProgress = json_encode($installProgress, Config\Config::JSON_OPTIONS);

        $saved = file_put_contents(self::INSTALL_FILE, $jsonInstallProgress);
        if (!$saved) {
            throw new \RuntimeException(
                "Unable to write JSON install process file. Check write access to config folder."
            );
        }

        return $installProgress;
    }

    private static function _executeSqlFile(string $sqlFile): void
    {
        $request = file_get_contents($sqlFile);
        if (!$request) {
            throw new \Exception("Unable to read file '$sqlFile'.");
        }

        $prefix  = Config\Config::getSettings('db')['prefix'];
        $request = preg_replace('/INTO `/', "INTO `$prefix", $request);

        $pdo = Config\Config::getPDO();
        $pdo->query($request);
    }

    private static function _executePhinxCommand(string $command): array
    {
        if (!in_array($command, ['status', 'migrate', 'rollback'], true)) {
            throw new \InvalidArgumentException("Commande de migration inconnue.", 2);
        }

        // - Allow very long time execution for migrations
        set_time_limit(3600);

        $stream = fopen('php://temp', 'w+');
        $exitCode = (new CliApp)->doRun(
            new ArrayInput([sprintf('migrations:%s', $command)]),
            new StreamOutput($stream)
        );
        $output = stream_get_contents($stream, -1, 0);
        fclose($stream);

        if (!in_array($exitCode, [0, 3])) {
            throw new \RuntimeException($output, $exitCode);
        }

        return explode(PHP_EOL, $output);
    }

    private static function _formatPhinxStatusOutput($output)
    {
        $start = array_search(str_repeat('-', 82), $output);
        $lines = array_splice($output, $start + 1);

        $status = [];
        foreach ($lines as $line) {
            if ($line === '') {
                continue;
            }
            $infos = explode("  ", trim($line));
            $infos = array_filter($infos, function ($info) {
                return trim($info) !== '';
            });

            $status[] = [
                'table' => end($infos),
                'state' => $infos[0]
            ];
        }

        return $status;
    }
}
