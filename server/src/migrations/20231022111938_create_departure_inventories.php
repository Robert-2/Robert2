<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateDepartureInventories extends AbstractMigration
{
    public function up(): void
    {
        $events = $this->table('events');
        $events
            ->addColumn('is_departure_inventory_done', 'boolean', [
                'null' => false,
                'default' => false,
                'after' => 'is_billable',
            ])
            ->addColumn('departure_inventory_author_id', 'integer', [
                'signed' => true,
                'null' => true,
                'default' => null,
                'after' => 'is_departure_inventory_done',
            ])
            ->addColumn('departure_inventory_datetime', 'datetime', [
                'null' => true,
                'default' => null,
                'after' => 'departure_inventory_author_id',
            ])
            ->addIndex(['departure_inventory_author_id'])
            ->addForeignKey('departure_inventory_author_id', 'users', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event__departure_inventory_author',
            ])
            ->update();

        $event_materials = $this->table('event_materials');
        $event_materials
            ->addColumn('quantity_departed', 'integer', [
                'signed' => false,
                'null' => true,
                'default' => null,
                'after' => 'quantity',
            ])
            ->addColumn('departure_comment', 'text', [
                'null' => true,
                'default' => null,
                'after' => 'quantity_returned_broken',
            ])
            ->update();

        $event_material_units = $this->table('event_material_units');
        $event_material_units
            ->addColumn('is_departed', 'boolean', [
                'default' => false,
                'null' => false,
                'after' => 'material_unit_id',
            ])
            ->addColumn('departure_comment', 'text', [
                'null' => true,
                'default' => null,
                'after' => 'is_returned_broken',
            ])
            ->update();

        $reservations = $this->table('reservations');
        $reservations
            ->addColumn('is_departure_inventory_done', 'boolean', [
                'null' => false,
                'default' => false,
                'after' => 'is_archived',
            ])
            ->addColumn('departure_inventory_author_id', 'integer', [
                'signed' => true,
                'null' => true,
                'default' => null,
                'after' => 'is_departure_inventory_done',
            ])
            ->addColumn('departure_inventory_datetime', 'datetime', [
                'null' => true,
                'default' => null,
                'after' => 'departure_inventory_author_id',
            ])
            ->addIndex(['departure_inventory_author_id'])
            ->addForeignKey('departure_inventory_author_id', 'users', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__reservation__departure_inventory_author',
            ])
            ->update();

        $reservation_materials = $this->table('reservation_materials');
        $reservation_materials
            ->addColumn('quantity_departed', 'integer', [
                'signed' => false,
                'null' => true,
                'default' => null,
                'after' => 'approver_id',
            ])
            ->addColumn('departure_comment', 'text', [
                'null' => true,
                'default' => null,
                'after' => 'quantity_returned_broken',
            ])
            ->update();

        $reservation_material_units = $this->table('reservation_material_units');
        $reservation_material_units
            ->addColumn('is_departed', 'boolean', [
                'default' => false,
                'null' => false,
                'after' => 'material_unit_id',
            ])
            ->addColumn('departure_comment', 'text', [
                'null' => true,
                'default' => null,
                'after' => 'is_returned_broken',
            ])
            ->update();
    }

    public function down(): void
    {
        $events = $this->table('events');
        $events
            ->dropForeignKey('departure_inventory_author_id')
            ->removeIndex(['departure_inventory_author_id'])
            ->update();
        $events
            ->removeColumn('is_departure_inventory_done')
            ->removeColumn('departure_inventory_author_id')
            ->removeColumn('departure_inventory_datetime')
            ->update();

        $event_materials = $this->table('event_materials');
        $event_materials
            ->removeColumn('quantity_departed')
            ->removeColumn('departure_comment')
            ->update();

        $event_material_units = $this->table('event_material_units');
        $event_material_units
            ->removeColumn('is_departed')
            ->removeColumn('departure_comment')
            ->update();

        $reservations = $this->table('reservations');
        $reservations
            ->dropForeignKey('departure_inventory_author_id')
            ->removeIndex(['departure_inventory_author_id'])
            ->update();
        $reservations
            ->removeColumn('is_departure_inventory_done')
            ->removeColumn('departure_inventory_author_id')
            ->removeColumn('departure_inventory_datetime')
            ->update();

        $reservation_materials = $this->table('reservation_materials');
        $reservation_materials
            ->removeColumn('quantity_departed')
            ->removeColumn('departure_comment')
            ->update();

        $reservation_material_units = $this->table('reservation_material_units');
        $reservation_material_units
            ->removeColumn('is_departed')
            ->removeColumn('departure_comment')
            ->update();
    }
}
