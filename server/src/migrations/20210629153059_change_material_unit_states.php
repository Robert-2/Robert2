<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class ChangeMaterialUnitStates extends AbstractMigration
{
    public function up(): void
    {
        $materialUnitsTable = $this->table('material_units');
        $materialUnitsTable
            ->dropForeignKey('material_unit_state_id')
            ->removeColumn('material_unit_state_id')
            ->save();

        $this->table('material_unit_states')->drop()->save();

        $unitStatesTable = $this->table('material_unit_states', ['id' => false, 'primary_key' => 'id']);
        $unitStatesTable
            ->addColumn('id', 'string', ['length' => 64, 'null' => false])
            ->addColumn('order', 'integer', ['signed' => true, 'null' => false])
            ->create();

        $states = [
            ['id' => 'state-of-use', 'order' => 1],
            ['id' => 'excellent', 'order' => 2],
            ['id' => 'brand-new', 'order' => 3],
            ['id' => 'bad', 'order' => 4],
            ['id' => 'outdated', 'order' => 5],
        ];
        $unitStatesTable->insert($states)->save();

        $materialUnitsTable
            ->addColumn('state', 'string', [
                'default' => 'state-of-use',
                'null' => false,
                'length' => 64,
                'after' => 'is_lost',
            ])
            ->addIndex(['state'])
            ->addForeignKey('state', 'material_unit_states', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_units_state',
            ])
            ->save();
    }

    public function down(): void
    {
        $materialUnitsTable = $this->table('material_units');
        $materialUnitsTable
            ->dropForeignKey('state')
            ->removeColumn('state')
            ->save();

        $this->table('material_unit_states')->drop()->save();

        $unitStatesTable = $this->table('material_unit_states', ['signed' => true]);
        $unitStatesTable
            ->addColumn('name', 'string', ['length' => 64, 'null' => false])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['name'], [
                'unique' => true,
                'name' => 'name_UNIQUE',
            ])
            ->create();

        $materialUnitsTable
            ->addColumn('material_unit_state_id', 'integer', [
                'signed' => true,
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
