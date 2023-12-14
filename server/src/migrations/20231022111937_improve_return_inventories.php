<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class ImproveReturnInventories extends AbstractMigration
{
    public function up(): void
    {
        $events = $this->table('events');
        $events
            ->addColumn('return_inventory_author_id', 'integer', [
                'signed' => true,
                'null' => true,
                'default' => null,
                'after' => 'is_return_inventory_done',
            ])
            ->addColumn('return_inventory_datetime', 'datetime', [
                'null' => true,
                'default' => null,
                'after' => 'return_inventory_author_id',
            ])
            ->addIndex(['return_inventory_author_id'])
            ->addForeignKey('return_inventory_author_id', 'users', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event__return_inventory_author',
            ])
            ->update();

        $reservations = $this->table('reservations');
        $reservations
            ->addColumn('return_inventory_author_id', 'integer', [
                'signed' => true,
                'null' => true,
                'default' => null,
                'after' => 'is_return_inventory_done',
            ])
            ->addColumn('return_inventory_datetime', 'datetime', [
                'null' => true,
                'default' => null,
                'after' => 'return_inventory_author_id',
            ])
            ->addIndex(['return_inventory_author_id'])
            ->addForeignKey('return_inventory_author_id', 'users', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__reservation__return_inventory_author',
            ])
            ->update();
    }

    public function down(): void
    {
        $events = $this->table('events');
        $events
            ->dropForeignKey('return_inventory_author_id')
            ->removeIndex(['return_inventory_author_id'])
            ->update();
        $events
            ->removeColumn('return_inventory_author_id')
            ->removeColumn('return_inventory_datetime')
            ->update();

        $reservations = $this->table('reservations');
        $reservations
            ->dropForeignKey('return_inventory_author_id')
            ->removeIndex(['return_inventory_author_id'])
            ->update();
        $reservations
            ->removeColumn('return_inventory_author_id')
            ->removeColumn('return_inventory_datetime')
            ->update();
    }
}
