<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddBookingAdditionalFields extends AbstractMigration
{
    public function up(): void
    {
        $reservations = $this->table('reservations');
        $reservations
            ->addColumn('note', 'text', [
                'null' => true,
                'after' => 'is_return_inventory_done',
            ])
            ->update();

        $events = $this->table('events');
        $events
            ->addColumn('color', 'char', [
                'length' => 7,
                'null' => true,
                'after' => 'end_date',
            ])
            ->addColumn('note', 'text', [
                'null' => true,
                'after' => 'is_return_inventory_done',
            ])
            ->update();
    }

    public function down(): void
    {
        $reservations = $this->table('reservations');
        $reservations
            ->removeColumn('note')
            ->update();

        $events = $this->table('events');
        $events
            ->removeColumn('color')
            ->removeColumn('note')
            ->update();
    }
}
