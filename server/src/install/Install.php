<?php
declare(strict_types=1);

namespace Robert2\Install;

use Robert2\API\Config\Config;
use Robert2\API\Console\App as CliApp;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\StreamOutput;

class Install
{
    protected const INSTALL_FILE = __DIR__ . '/progress.json';

    // See in SetupController for steps execution
    public const INSTALL_STEPS = [
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

    public const REQUIRED_EXTENSIONS = [
        'apcu',
        'bcmath',
        'dom',
        'fileinfo',
        'gettext',
        'iconv',
        'intl',
        'json',
        'mbstring',
        'pcre',
        'PDO',
        'pdo_mysql',
        'xml',
    ];

    protected const VALUE_TYPES = [
        'enableCORS' => 'boolean',
        'displayErrorDetails' => 'boolean',
        'useRouterCache' => 'boolean',
        'useHTTPS' => 'boolean',
        'sessionExpireHours' => 'integer',
        'maxItemsPerPage' => 'integer',
        'vatRate' => 'float',
    ];

    public static function getStep(): string
    {
        $installData = static::_getInstallData();
        return $installData['step'] ?? 'welcome';
    }

    public static function setInstallProgress(string $step, ?array $stepData = null): array
    {
        if (!in_array($step, self::INSTALL_STEPS, true)) {
            throw new \InvalidArgumentException(sprintf('Unknown step: %s', $step));
        }

        $installData = static::_getInstallData();

        if ($stepData === null) {
            $installData['step'] = $step;
            $installData["config_$step"] = [];

            return static::_saveInstallData($installData);
        }

        $stepIndex = array_search($step, self::INSTALL_STEPS);
        $nextStep = self::INSTALL_STEPS[$stepIndex + 1] ?? 'end';

        foreach ($stepData as $key => $value) {
            $keyType = self::VALUE_TYPES[$key] ??  null;
            if ($keyType === 'boolean') {
                $stepData[$key] = (bool) $value;
            }
            if ($keyType === 'integer') {
                $stepData[$key] = (int) $value;
            }
            if ($keyType === 'float') {
                $stepData[$key] = (float) $value;
            }
        }

        $installData["config_$step"] = $stepData;
        $installData['step'] = $nextStep;

        return static::_saveInstallData($installData);
    }

    public static function getSettingsFromInstallData(): array
    {
        $installData = static::_getInstallData();

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

    public static function migrateDatabase(): array
    {
        return self::_executePhinxCommand('migrate');
    }

    public static function getAllCurrencies(): array
    {
        return require 'data/currencies.php';
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    protected static function _getInstallData(): array
    {
        if (!file_exists(self::INSTALL_FILE)) {
            return [];
        }

        $installData = json_decode(@file_get_contents(self::INSTALL_FILE), true);
        if (!is_array($installData)) {
            return [];
        }

        return $installData;
    }

    protected static function _saveInstallData(array $installData): array
    {
        $installDataAsJson = json_encode($installData, Config::JSON_OPTIONS);
        if (!file_put_contents(self::INSTALL_FILE, $installDataAsJson)) {
            throw new \RuntimeException(
                "Unable to write JSON install data file. Check write access to `install` folder."
            );
        }
        return $installData;
    }

    protected static function _executePhinxCommand(string $command): array
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

        if (!in_array($exitCode, [0, 3], true)) {
            throw new \RuntimeException($output, $exitCode);
        }

        return explode(PHP_EOL, $output);
    }

    protected static function _formatPhinxStatusOutput($output)
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
                'state' => $infos[0],
            ];
        }

        return $status;
    }
}
