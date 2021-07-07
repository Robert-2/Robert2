<?php
use Phinx\Migration\AbstractMigration;

class AddIsReturnInventoryDoneToEvents extends AbstractMigration
{
    public function up()
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

    public function down()
    {
        $table = $this->table('events');
        $table
            ->removeColumn('is_return_inventory_done')
            ->save();
    }
}
