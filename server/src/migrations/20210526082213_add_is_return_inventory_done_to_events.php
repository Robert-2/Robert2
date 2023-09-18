<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddIsReturnInventoryDoneToEvents extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('events');
        $table
            ->addColumn('is_return_inventory_done', 'boolean', [
                'after' => 'is_billable',
                'null' => false,
                'default' => false,
            ])
            ->save();
    }

    public function down(): void
    {
        $table = $this->table('events');
        $table
            ->removeColumn('is_return_inventory_done')
            ->save();
    }
}
