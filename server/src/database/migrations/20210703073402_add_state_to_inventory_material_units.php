<?php
use Phinx\Migration\AbstractMigration;

class AddStateToInventoryMaterialUnits extends AbstractMigration
{
    public function up()
    {
        $inventoryMaterialUnitsTable = $this->table('inventory_material_units');
        $inventoryMaterialUnitsTable
            ->addColumn('state_previous', 'string', [
                'length' => 64,
                'null' => true,
                'after' => 'is_broken_current',
            ])
            ->addColumn('state_current', 'string', [
                'length' => 64,
                'null' => true,
                'after' => 'state_previous',
            ])
            ->addIndex(['state_previous'])
            ->addIndex(['state_current'])
            ->addForeignKey('state_previous', 'material_unit_states', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_units_state_previous',
            ])
            ->addForeignKey('state_current', 'material_unit_states', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_units_state_ccurent',
            ])
            ->save();

        $units = $this->fetchAll(
            "SELECT imu.`id`, mu.`state`
             FROM inventory_material_units AS imu
             LEFT JOIN material_units AS mu ON imu.`material_unit_id` = mu.`id`"
        );
        foreach ($units as $unit) {
            $this->execute(vsprintf(
                // phpcs:ignore Generic.Files.LineLength
                'UPDATE `inventory_material_units` SET `state_previous`="%2$s", `state_current`="%2$s" WHERE `id` = %1$d',
                [$unit['id'], $unit['state']]
            ));
        }

        $inventoryMaterialUnitsTable
            ->changeColumn('state_current', 'string', ['length' => 64])
            ->update();
    }

    public function down()
    {
        $inventoryMaterialUnitsTable = $this->table('inventory_material_units');
        $inventoryMaterialUnitsTable
            ->dropForeignKey('state_previous')
            ->dropForeignKey('state_current')
            ->removeColumn('state_previous')
            ->removeColumn('state_current')
            ->save();
    }
}
