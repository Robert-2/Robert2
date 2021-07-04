<?php
use Phinx\Migration\AbstractMigration;

class AddIsReturnedToEventMaterialUnits extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('event_material_units');
        $table
            ->addColumn('is_returned', 'boolean', [
                'default' => false,
                'after' => 'material_unit_id',
            ])
            ->addColumn('is_returned_broken', 'boolean', [
                'default' => false,
                'after' => 'is_returned',
            ])
            ->save();
    }

    public function down()
    {
        $table = $this->table('event_material_units');
        $table
            ->removeColumn('is_returned')
            ->removeColumn('is_returned_broken')
            ->save();
    }
}
