<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class RemoveSomeSoftDeletable extends AbstractMigration
{
    private const TABLES = ['countries', 'attributes'];

    public function up(): void
    {
        foreach (self::TABLES as $tableName) {
            $table = $this->table($tableName);
            $table
                ->removeColumn('deleted_at')
                ->update();
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $tableName) {
            $table = $this->table($tableName);
            $table
                ->addColumn('deleted_at', 'datetime', ['null' => true, 'after' => 'updated_at'])
                ->update();
        }
    }
}
