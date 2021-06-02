<?php
use Phinx\Migration\AbstractMigration;

class AddFieldsToMaterialUnits extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('material_units');
        $table
            ->addColumn('is_lost', 'boolean', [
                'null' => false,
                'default' => false,
                'after' => 'is_broken',
            ])
            ->addColumn('material_unit_state_id', 'integer', [
                'null' => true,
                'after' => 'is_lost',
            ])
            ->addColumn('purchase_date', 'date', [
                'null' => true,
                'after' => 'material_unit_state_id',
            ])
            ->addColumn('notes', 'text', [
                'null' => true,
                'after' => 'purchase_date',
            ])
            ->addIndex(['material_unit_state_id'])
            ->addForeignKey('material_unit_state_id', 'material_unit_states', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_units_material_unit_state',
            ])
            ->save();
    }

    public function down()
    {
        $table = $this->table('material_units');
        $table
            ->dropForeignKey('material_unit_state_id')
            ->removeColumn('is_lost')
            ->removeColumn('material_unit_state_id')
            ->removeColumn('purchase_date')
            ->removeColumn('notes')
            ->save();
    }
}
