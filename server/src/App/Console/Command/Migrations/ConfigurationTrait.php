<?php
declare(strict_types=1);

namespace Robert2\API\Console\Command\Migrations;

use Phinx\Config\Config as PhinxConfig;
use Phinx\Config\ConfigInterface;
use Robert2\API\Config\Config;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

trait ConfigurationTrait
{
    public function getConfig(): ConfigInterface
    {
        if (!$this->config) {
            $dbConfig = Config::getDbConfig();
            $env = Config::getEnv();
            $pdo = Config::getPDO();

            $this->config = new PhinxConfig([
                'paths' => [
                    'migrations' => SRC_FOLDER . DS . 'migrations',
                    'seeds' => SRC_FOLDER . DS . 'migrations' . DS . 'seeds',
                ],
                'environments' => [
                    'default_environment' => $env,
                    $env => [
                        'table_prefix' => $dbConfig['prefix'],
                        'name' => $dbConfig['database'],
                        'connection' => $pdo,
                        'charset' => $dbConfig['charset'],
                        'collation' => $dbConfig['collation'],
                    ],
                ],
            ]);
        }
        return $this->config;
    }

    public function hasConfig(): bool
    {
        return true;
    }

    public function setConfig(ConfigInterface $config)
    {
        throw new \Exception('Non implémenté.');
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    protected function configure(): void
    {
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // - Phinx utilise `environment` plutôt que `env`, donc on ajoute l'alias artificiellement.
        $this->addOption('environment', null, InputOption::VALUE_REQUIRED, '', Config::getEnv());

        return parent::execute($input, $output);
    }

    protected function getMigrationTemplateFilename(string $style): string
    {
        return __DIR__ . '/templates/Migration.php.template';
    }

    protected function getSeedTemplateFilename(): string
    {
        return __DIR__ . '/templates/Seed.php.template';
    }
}
