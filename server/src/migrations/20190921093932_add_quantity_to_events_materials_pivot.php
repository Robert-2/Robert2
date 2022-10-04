<?php
use Phinx\Migration\AbstractMigration;

class AddQuantityToEventsMaterialsPivot extends AbstractMigration
{
    public function up()
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

    public function down()
    {
        $this->table('event_materials')
            ->removeColumn('quantity')
            ->update();
    }
}
