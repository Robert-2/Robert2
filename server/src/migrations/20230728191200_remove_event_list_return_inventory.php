<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class RemoveEventListReturnInventory extends AbstractMigration
{
    public function up(): void
    {
        $event_list_materials = $this->table('event_list_materials');
        $event_list_materials
            ->removeColumn('quantity_returned')
            ->removeColumn('quantity_returned_broken')
            ->update();
    }

    public function down(): void
    {
        $event_list_materials = $this->table('event_list_materials');
        $event_list_materials
            ->addColumn('quantity_returned', 'integer', [
                'signed' => false,
                'null' => true,
                'default' => null,
                'after' => 'quantity',
            ])
            ->addColumn('quantity_returned_broken', 'integer', [
                'signed' => false,
                'null' => true,
                'default' => null,
                'after' => 'quantity_returned',
            ])
            ->update();
    }
}
