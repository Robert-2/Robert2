<?php
use Phinx\Migration\AbstractMigration;

class AddReturnQuantitiesToEventMaterials extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('event_materials');
        $table
            ->addColumn('quantity_returned', 'integer', [
                'after' => 'quantity',
                'null' => false,
                'signed' => false,
                'limit' => 6,
                'default' => 0,
            ])
            ->addColumn('quantity_broken', 'integer', [
                'after' => 'quantity_returned',
                'null' => false,
                'signed' => false,
                'limit' => 6,
                'default' => 0,
            ])
            ->save();
    }

    public function down()
    {
        $table = $this->table('event_materials');
        $table
            ->removeColumn('quantity_returned')
            ->removeColumn('quantity_broken')
            ->save();
    }
}
