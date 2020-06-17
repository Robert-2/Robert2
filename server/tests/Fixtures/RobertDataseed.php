<?php
declare(strict_types=1);

namespace Robert2\Fixtures;

use Robert2\API\Config;

class RobertDataseed
{
    public $dataseedQuery = '';

    public function __construct()
    {
        $this->pdo      = RobertFixtures::getConnection();
        $this->dbConfig = Config\Config::getDbConfig();
    }

    public function __destruct()
    {
        $this->pdo = null;
    }

    public function set(string $table): void
    {
        if (!$table) {
            throw new \Exception("Missing 'table' argument.");
        }

        $this->data = $this->_getData($table);
        if (empty($this->data)) {
            return;
        }

        $fields = implode('`,`', array_keys($this->data[0]));

        $tableQuery = "INSERT INTO `$table` (`$fields`) VALUES";
        foreach ($this->data as $entry) {
            $values = array_map([$this, '_formatValue'], array_values($entry));
            $values = implode(', ', $values);

            $tableQuery .= "\n($values),";
        }

        $this->dataseedQuery .= trim($tableQuery, ',') . ";\n";
    }

    public function getFinalQuery()
    {
        return $this->dataseedQuery;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Protected methods
    // —
    // ——————————————————————————————————————————————————————

    protected function _getData($table): array
    {
        $table = preg_replace('/^' . $this->dbConfig['prefix'] . '/', '', $table);

        $seedFilePath = sprintf('tests/Fixtures/seed/%s.json', $table);

        if (!is_file($seedFilePath)) {
            throw new \Exception("Missing json data seed file for model '$table'.");
        }

        $seedData = json_decode(file_get_contents($seedFilePath), true);
        if (!is_array($seedData)) {
            throw new \Exception("Unable to json decode data seed file.");
        }

        return $seedData;
    }

    private function _formatValue($value)
    {
        if ($value === null) {
            $value = "NULL";
        } elseif (is_array($value)) {
            $value = sprintf('"%s"', addslashes(json_encode($value)));
        } else {
            $value = sprintf('"%s"', addslashes((string)$value));
        }
        return $value;
    }
}
