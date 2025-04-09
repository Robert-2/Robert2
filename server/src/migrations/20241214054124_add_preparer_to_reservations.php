<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddPreparerToReservations extends AbstractMigration
{
    public function up(): void
    {
        $reservations = $this->table('reservations');
        $reservations
            ->addColumn('preparer_id', 'integer', [
                'signed' => true,
                'null' => true,
                'after' => 'operation_is_full_days',
            ])
            ->addIndex(['preparer_id'])
            ->addForeignKey('preparer_id', 'technicians', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__reservations__preparer',
            ])
            ->update();
    }

    public function down(): void
    {
        $reservations = $this->table('reservations');
        $reservations
            ->dropForeignKey('preparer_id')
            ->save();
        $reservations
            ->removeColumn('preparer_id')
            ->update();
    }
}
