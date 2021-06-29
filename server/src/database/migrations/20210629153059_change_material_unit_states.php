<?php
use Phinx\Migration\AbstractMigration;

class ChangeMaterialUnitStates extends AbstractMigration
{
    public function up()
    {
        $materialUnitsTable = $this->table('material_units');
        $materialUnitsTable
            ->dropForeignKey('material_unit_state_id')
            ->removeColumn('material_unit_state_id')
            ->save();

        $this->table('material_unit_states')->drop()->save();

        $unitStatesTable = $this->table('material_unit_states', ['id' => false, 'primary_key' => 'name']);
        $unitStatesTable
            ->addColumn('name', 'string', ['length' => 64])
            ->addColumn('order', 'integer', ['signed' => false])
            ->create();

        $states = [
            [
                'name' => 'state-of-use',
                'order' => 1,
            ],
            [
                'name' => 'excellent',
                'order' => 2,
            ],
            [
                'name' => 'brand-new',
                'order' => 3,
            ],
            [
                'name' => 'bad',
                'order' => 4,
            ],
            [
                'name' => 'outdated',
                'order' => 5,
            ],
        ];
        $unitStatesTable->insert($states)->save();

        $materialUnitsTable
            ->addColumn('state', 'string', [
                'null' => true,
                'length' => 64,
                'after' => 'is_lost',
            ])
            ->addIndex(['state'])
            ->addForeignKey('state', 'material_unit_states', 'name', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_units_state',
            ])
            ->save();
    }

    public function down()
    {
        $materialUnitsTable = $this->table('material_units');
        $materialUnitsTable
            ->dropForeignKey('state')
            ->removeColumn('state')
            ->save();

        $this->table('material_unit_states')->drop()->save();

        $unitStatesTable = $this->table('material_unit_states');
        $unitStatesTable
            ->addColumn('name', 'string', ['length' => 64])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['name'], [
                'unique' => true,
                'name' => 'name_UNIQUE'
            ])
            ->create();


        $materialUnitsTable
            ->addColumn('material_unit_state_id', 'integer', [
                'null' => true,
                'after' => 'is_lost',
            ])
            ->addIndex(['material_unit_state_id'])
            ->addForeignKey('material_unit_state_id', 'material_unit_states', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_units_material_unit_state',
            ])
            ->save();
    }
}
