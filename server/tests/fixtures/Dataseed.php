<?php
declare(strict_types=1);

namespace Loxya\Tests\Fixtures;

use Loxya\Config;

final class Dataseed
{
    private string $tablePrefix;
    private string $dataseedQuery = '';

    private static array $cachedData = [];

    public function __construct()
    {
        $this->tablePrefix = Config\Config::getDbConfig()['prefix'] ?? '';
    }

    public function set(string $table): void
    {
        if (!$table) {
            throw new \Exception("Missing 'table' argument.");
        }

        $tableQuery = sprintf("TRUNCATE `%s`;\n", $table);

        $tableData = $this->_getData($table);
        if (empty($tableData)) {
            $this->dataseedQuery .= sprintf("%s\n", $tableQuery);
            return;
        }

        $fields = implode('`,`', array_keys($tableData[0]));
        $tableQuery .= vsprintf(
            "INSERT INTO `%s` (`%s`) VALUES",
            [$table, $fields]
        );

        foreach ($tableData as $entry) {
            $values = array_map([$this, '_formatValue'], array_values($entry));
            $tableQuery .= sprintf("\n(%s),", implode(', ', $values));
        }

        $this->dataseedQuery .= sprintf("%s;\n", trim($tableQuery, ','));
    }

    public function getFinalQuery()
    {
        $query  = "SET FOREIGN_KEY_CHECKS=0;\n\n";
        $query .= $this->dataseedQuery . "\n";
        $query .= "SET FOREIGN_KEY_CHECKS=1;";

        return $query;
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    private function _getData($table): array
    {
        $table = preg_replace(sprintf('/^%s/', preg_quote($this->tablePrefix, '/')), '', $table);
        if (array_key_exists($table, static::$cachedData)) {
            return static::$cachedData[$table];
        }

        $seedFilePath = sprintf('tests/fixtures/seed/%s.json', $table);
        if (!is_file($seedFilePath)) {
            throw new \Exception("Missing json data seed file for model '$table'.");
        }

        $seedData = json_decode(file_get_contents($seedFilePath), true);
        if (!is_array($seedData)) {
            throw new \Exception("Unable to json decode data seed file.");
        }

        return static::$cachedData[$table] = $seedData;
    }

    private function _formatValue($value)
    {
        if ($value === null) {
            $value = "NULL";
        } elseif (is_array($value)) {
            $value = sprintf('"%s"', addslashes(json_encode($value)));
        } elseif (is_bool($value)) {
            $value = sprintf('%s', $value ? 1 : 0);
        } else {
            $value = sprintf('"%s"', addslashes((string) $value));
        }
        return $value;
    }
}
