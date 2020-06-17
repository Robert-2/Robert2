<?php
declare(strict_types=1);

namespace Robert2\Fixtures;

use Ifsnop\Mysqldump as IMysqldump;

use Robert2\API\Config;

class RobertFixtures
{
    const DUMP_DIR         = __DIR__ . '/tmp/';
    const DATA_DUMP_FILE   = __DIR__ . '/tmp/data.sql';
    const SCHEMA_DUMP_FILE = __DIR__ . '/tmp/schema.sql';

    public static function getConnection(): \PDO
    {
        return Config\Config::getPDO();
    }

    public static function resetTestDatabase(): void
    {
        self::dropCreateTestDatabase();
        self::runMigrations();

        self::dumpTestSchema();
        self::dumpTestData();
    }

    public static function dropCreateTestDatabase(): void
    {
        $dbConfig = Config\Config::getDbConfig();

        echo sprintf("Drop and re-create database '%s'...", $dbConfig['testDatabase']);

        $sqlRecreate = sprintf(
            'DROP DATABASE IF EXISTS %1$s; CREATE DATABASE %1$s;',
            $dbConfig['testDatabase']
        );

        $pdo = self::getConnection();
        $pdo->prepare($sqlRecreate)->execute();
        $pdo = null;

        echo "\nOK.\n\n";
    }

    public static function runMigrations(): void
    {
        echo "Running migrations for tests...\n";

        $output = [];
        exec('src/vendor/bin/phinx --configuration=src/database/phinx.php --environment=test migrate', $output);

        echo implode("\n", $output) . "\n\n";
    }

    public static function getAllTables(): array
    {
        $dbConfig = Config\Config::getDbConfig();

        $query = sprintf("
            SELECT `TABLE_NAME` FROM `information_schema`.`TABLES`
            WHERE `TABLE_SCHEMA` = '%s' AND `TABLE_NAME` != 'phinxlog';
        ", $dbConfig['testDatabase']);

        $pdo  = self::getConnection();
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $pdo = null;

        $tables = $stmt->fetchAll(\PDO::FETCH_COLUMN);

        return $tables;
    }

    public static function dumpTestSchema(): void
    {
        if (!is_dir(dirname(self::DATA_DUMP_FILE))) {
            mkdir(dirname(self::DATA_DUMP_FILE), 0755, true);
            echo "Temporary dump directory created.\n";
        }

        $dbConfig = Config\Config::getDbConfig(['noCharset' => true]);

        echo sprintf(
            "Dumping test database '%s'...\n",
            $dbConfig['testDatabase']
        );

        $dump = new IMysqldump\Mysqldump(
            $dbConfig['dsn'],
            $dbConfig['username'],
            $dbConfig['password'],
            [
                'add-drop-table'       => true,
                'skip-comments'        => true,
                'no-data'              => true,
                'reset-auto-increment' => true,
            ]
        );

        $dumpFile = self::SCHEMA_DUMP_FILE;

        $dump->start($dumpFile);

        echo "Optimizing dump file (Memory engine, varchar, etc.)...\n";

        $dumpContent  = sprintf("USE %s;\n", $dbConfig['testDatabase']);
        $dumpContent .= file_get_contents($dumpFile);

        $prefixedTable = sprintf('CREATE TABLE `%s`.', $dbConfig['testDatabase']);
        $dumpContent   = str_replace('CREATE TABLE ', $prefixedTable, $dumpContent);

        $dumpContent = str_replace('` text', '` varchar(1024)', $dumpContent);
        $dumpContent = str_replace('` json', '` varchar(1024)', $dumpContent);
        $dumpContent = str_replace('InnoDB', 'MEMORY', $dumpContent);

        file_put_contents($dumpFile, $dumpContent);

        echo "OK.\n\n";
    }

    public static function dumpTestData(): void
    {
        $startTime = microtime(true);

        $tables = self::getAllTables();
        if (empty($tables)) {
            throw new \InvalidArgumentException("No table found to seed.");
        }

        echo "Creating data SQL dump...\n";

        $dataseed = new RobertDataseed();
        foreach ($tables as $table) {
            $dataseed->set($table);
        }

        file_put_contents(self::DATA_DUMP_FILE, $dataseed->getFinalQuery());

        echo "OK, done in " . getExecutionTime($startTime) . ".\n\n";
    }

    public static function resetDataWithDump(array $options = []): void
    {
        $startTime = microtime(true);
        $dbConfig  = Config\Config::getDbConfig();

        $options = array_merge([
            'verbose'  => false,
            'withData' => true
        ], $options);

        if ($options['verbose']) {
            echo sprintf("\nUse dump files to reset database '%s'...\n", $dbConfig['testDatabase']);
        }

        try {
            $pdo = self::getConnection();

            $querySchema = file_get_contents(self::SCHEMA_DUMP_FILE);
            $pdo->prepare($querySchema)->execute();

            if ($options['withData']) {
                $queryData = file_get_contents(self::DATA_DUMP_FILE);
                $pdo->prepare($queryData)->execute();
            }

            if ($options['verbose']) {
                echo "OK, done in " . getExecutionTime($startTime) . ".\n\n";
            }
            $pdo = null;
        } catch (\Exception $e) {
            echo "\033[91m\n\nThere is an SQL error in fixtures data.\n";
            echo "Please check `tests/Fixtures/tmp/data.sql` and all seed files you have modified.\n";
            echo "Here is the detailed SQL error message:\n\n";
            echo $e->getMessage();
            echo "\033[0m\n\n";
            exit(1);
        }
    }
}
