<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class RemoveSomeSoftDeletable extends AbstractMigration
{
    private array $__tables = ['countries', 'attributes'];

    public function up(): void
    {
        foreach ($this->__tables as $tableName) {
            $tables = $this->table($tableName);
            $tables
                ->removeColumn('deleted_at')
                ->update();
        }
    }

    public function down(): void
    {
        foreach ($this->__tables as $tableName) {
            $tables = $this->table($tableName);
            $tables
                ->addColumn('deleted_at', 'datetime', ['null' => true, 'after' => 'updated_at'])
                ->update();
        }
    }
}
