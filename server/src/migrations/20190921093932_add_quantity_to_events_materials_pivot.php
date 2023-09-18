<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddQuantityToEventsMaterialsPivot extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('event_materials');
        $table
            ->addColumn('quantity', 'integer', [
                'after' => 'material_id',
                'null' => false,
                'signed' => false,
                'limit' => 6,
                'default' => 1,
            ])
            ->update();
    }

    public function down(): void
    {
        $this->table('event_materials')
            ->removeColumn('quantity')
            ->update();
    }
}
