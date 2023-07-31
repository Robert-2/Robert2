<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class MultiListsSupportInEvents extends AbstractMigration
{
    public function up(): void
    {
        $event_lists = $this->table('event_lists', ['signed' => true]);
        $event_lists
            ->addColumn('event_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('name', 'string', ['length' => 100, 'null' => false])
            ->addColumn('created_at', 'datetime', ['null' => false])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addIndex(['event_id'])
            ->addForeignKey('event_id', 'events', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event_list__event',
            ])
            ->addIndex(['event_id', 'name'], [
                'unique' => true,
            ])
            ->create();

        $event_list_materials = $this->table('event_list_materials', ['signed' => true]);
        $event_list_materials
            ->addColumn('event_list_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('event_material_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('quantity', 'integer', [
                'after' => 'material_id',
                'null' => false,
                'signed' => false,
                'limit' => 6,
                'default' => 1,
            ])
            ->addColumn('quantity_returned', 'integer', [
                'signed' => false,
                'null' => true,
                'default' => null,
            ])
            ->addColumn('quantity_returned_broken', 'integer', [
                'signed' => false,
                'null' => true,
                'default' => null,
            ])
            ->addIndex(['event_list_id'])
            ->addForeignKey('event_list_id', 'event_lists', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event_list_material__event_list',
            ])
            ->addIndex(['event_material_id'])
            ->addForeignKey('event_material_id', 'event_materials', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event_list_material__event_material',
            ])
            ->addIndex(['event_list_id', 'event_material_id'], [
                'unique' => true,
            ])
            ->create();

        $event_material_units = $this->table('event_material_units');
        $event_material_units
            ->addColumn('event_list_material_id', 'integer', [
                'null' => true,
                'signed' => true,
                'after' => 'event_material_id',
            ])
            ->addIndex(['event_list_material_id'])
            ->addForeignKey('event_list_material_id', 'event_list_materials', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event_material_unit__event_list_material',
            ])
            ->addIndex(['event_list_material_id', 'material_unit_id'], [
                'unique' => true,
            ])
            ->update();
    }

    public function down(): void
    {
        $event_material_units = $this->table('event_material_units');
        $event_material_units
            ->dropForeignKey('event_list_material_id')
            ->removeIndex(['event_list_material_id', 'material_unit_id'])
            ->removeColumn('event_list_material_id')
            ->update();

        $this->table('event_list_materials')->drop()->save();
        $this->table('event_lists')->drop()->save();
    }
}
