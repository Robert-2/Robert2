<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateUnitsTables extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('materials');
        $table
            ->changeColumn('park_id', 'integer', ['signed' => true, 'null' => true])
            ->changeColumn('stock_quantity', 'integer', ['length' => 5, 'null' => true])
            ->addColumn('is_unitary', 'boolean', [
                'default' => false,
                'after' => 'reference',
                'null' => false,
            ])
            ->save();

        $table = $this->table('material_units', ['signed' => true]);
        $table
            ->addColumn('material_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('serial_number', 'string', ['length' => 64, 'null' => false])
            ->addColumn('is_broken', 'boolean', ['default' => false, 'null' => false])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addIndex(['material_id', 'serial_number'], ['unique' => true])
            ->addForeignKey('material_id', 'materials', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_units_material',
            ])
            ->create();

        $table = $this->table('event_material_units', ['signed' => true]);
        $table
            ->addColumn('event_material_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('material_unit_id', 'integer', ['signed' => true, 'null' => false])
            ->addIndex(['event_material_id'])
            ->addIndex(['material_unit_id'])
            ->addIndex(['event_material_id', 'material_unit_id'], ['unique' => true])
            ->addForeignKey('event_material_id', 'event_materials', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_event_material_unit_event_material',
            ])
            ->addForeignKey('material_unit_id', 'material_units', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_event_material_unit_material_unit',
            ])
            ->create();
    }

    public function down(): void
    {
        $park = $this->fetchRow('SELECT id FROM parks ORDER BY id LIMIT 1');
        if ($park) {
            $this->execute(sprintf("UPDATE `materials` SET `park_id` = %d WHERE `park_id` IS NULL", $park['id']));
        } else {
            $this->execute("DELETE FROM `materials` WHERE `park_id` IS NULL");
        }
        $this->execute("UPDATE `materials` SET `stock_quantity` = 0 WHERE `stock_quantity` IS NULL");

        $table = $this->table('materials');
        $table
            ->changeColumn('park_id', 'integer', ['signed' => true, 'null' => false])
            ->changeColumn('stock_quantity', 'integer', ['length' => 5, 'null' => false])
            ->removeColumn('is_unitary')
            ->save();

        $this->table('event_material_units')->drop()->save();
        $this->table('material_units')->drop()->save();
    }
}
