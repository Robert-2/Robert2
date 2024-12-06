<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateMaterialUnitAttributes extends AbstractMigration
{
    public function up(): void
    {
        $material_unit_properties = $this->table('material_unit_properties', ['signed' => true]);
        $material_unit_properties
            ->addColumn('material_unit_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('property_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('value', 'text', ['null' => true])
            ->addIndex(['property_id'])
            ->addIndex(['material_unit_id'])
            ->addIndex(['property_id', 'material_unit_id'], ['unique' => true])
            ->addForeignKey('material_unit_id', 'material_units', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__material_unit_property__material_unit',
            ])
            ->addForeignKey('property_id', 'attributes', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__material_unit_property__attribute',
            ])
            ->create();

        $attributes = $this->table('attributes');
        $attributes
            ->addColumn('entities', 'set', [
                'values' => ['material', 'material-unit'],
                'after' => 'name',
                'default' => 'material',
                'null' => false,
            ])
            ->save();

        $attributes
            ->changeColumn('entities', 'set', [
                'values' => ['material', 'material-unit'],
                'null' => false,
            ])
            ->save();
    }

    public function down(): void
    {
        $attributes = $this->table('attributes');
        $attributes
            ->removeColumn('entities')
            ->save();

        $this->table('material_unit_properties')->drop()->save();
    }
}
