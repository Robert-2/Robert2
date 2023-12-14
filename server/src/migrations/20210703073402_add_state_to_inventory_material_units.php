<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;
use Loxya\Config\Config;

final class AddStateToInventoryMaterialUnits extends AbstractMigration
{
    public function up(): void
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

        $prefix = Config::get('db.prefix');

        $units = $this->fetchAll(sprintf(
            'SELECT imu.`id`, mu.`state`
            FROM `%1$sinventory_material_units` AS imu
            LEFT JOIN `%1$smaterial_units` AS mu ON imu.`material_unit_id` = mu.`id`',
            $prefix
        ));
        foreach ($units as $unit) {
            $this->execute(sprintf(
                'UPDATE `%1$sinventory_material_units`
                SET `state_previous` = "%3$s", `state_current` = "%3$s" WHERE `id` = %2$d',
                $prefix,
                $unit['id'],
                $unit['state']
            ));
        }

        $inventoryMaterialUnitsTable
            ->dropForeignKey('state_current')
            ->save();

        $inventoryMaterialUnitsTable
            ->changeColumn('state_current', 'string', ['length' => 64, 'null' => false])
            ->addForeignKey('state_current', 'material_unit_states', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_units_state_current',
            ])
            ->save();
    }

    public function down(): void
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
