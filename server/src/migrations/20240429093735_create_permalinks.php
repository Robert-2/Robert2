<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreatePermalinks extends AbstractMigration
{
    public function up(): void
    {
        $permalinks = $this->table('permalinks', ['id' => false, 'primary_key' => 'id']);
        $permalinks
            ->addColumn('id', 'string', [
                'null' => false,
                'length' => 36,
            ])
            ->addColumn('entity_type', 'enum', [
                'values' => ['event', 'reservation'],
                'null' => false,
            ])
            ->addColumn('entity_id', 'integer', [
                'signed' => true,
                'null' => false,
            ])
            ->addIndex(['entity_type', 'entity_id'], ['unique' => true])
            ->create();
    }

    public function down(): void
    {
        $this->table('permalinks')->drop()->save();
    }
}
