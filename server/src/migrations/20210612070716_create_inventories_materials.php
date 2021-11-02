<?php
use Phinx\Migration\AbstractMigration;

class CreateInventoriesMaterials extends AbstractMigration
{
    public function up()
    {
        $inventoryMaterials = $this->table('inventory_materials');
        $inventoryMaterials
            ->addColumn('inventory_id', 'integer')
            ->addColumn('material_id', 'integer', ['null' => true])
            ->addColumn('reference', 'string', ['length' => 64])
            ->addColumn('name', 'string', ['length' => 191])
            ->addColumn('is_unitary', 'boolean')
            ->addColumn('is_new', 'boolean', ['default' => false])

            // - `stock_quantity`
            ->addColumn('stock_quantity_previous', 'integer', ['length' => 5, 'null' => true])
            ->addColumn('stock_quantity_current', 'integer', ['length' => 5, 'null' => true])

            // - `out_of_order`
            ->addColumn('out_of_order_quantity_previous', 'integer', ['length' => 5, 'null' => true])
            ->addColumn('out_of_order_quantity_current', 'integer', ['length' => 5, 'null' => true])

            // - Meta
            ->addIndex(['inventory_id'])
            ->addForeignKey('inventory_id', 'inventories', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_inventory_materials_inventories'
            ])
            ->addIndex(['material_id'])
            ->addForeignKey('material_id', 'materials', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_inventory_materials_materials'
            ])
            ->addIndex(['inventory_id', 'material_id'], [
                'unique' => true,
                'name' => 'inventory_material_UNIQUE'
            ])
            ->create();


        $inventoryMaterialUnits = $this->table('inventory_material_units');
        $inventoryMaterialUnits
            ->addColumn('inventory_material_id', 'integer')
            ->addColumn('material_unit_id', 'integer', ['null' => true])
            ->addColumn('reference', 'string', ['length' => 64])
            ->addColumn('is_new', 'boolean', ['default' => false])

            // - `is_lost`
            ->addColumn('is_lost_previous', 'boolean', ['null' => true])
            ->addColumn('is_lost_current', 'boolean')

            // - `is_broken`
            ->addColumn('is_broken_previous', 'boolean', ['null' => true])
            ->addColumn('is_broken_current', 'boolean')

            // - Meta
            ->addIndex(['inventory_material_id'])
            ->addForeignKey('inventory_material_id', 'inventory_materials', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_inventory_material_units_inventories'
            ])
            ->addIndex(['material_unit_id'])
            ->addForeignKey('material_unit_id', 'material_units', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_inventory_material_units_material_units'
            ])
            ->addIndex(['inventory_material_id', 'material_unit_id'], [
                'unique' => true,
                'name' => 'inventory_unit_UNIQUE'
            ])
            ->create();
    }

    public function down()
    {
        $this->table('inventory_material_units')->drop()->save();
        $this->table('inventory_materials')->drop()->save();
    }
}
