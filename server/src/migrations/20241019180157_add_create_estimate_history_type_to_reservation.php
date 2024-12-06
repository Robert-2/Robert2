<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddCreateEstimateHistoryTypeToReservation extends AbstractMigration
{
    public function up(): void
    {
        $reservationHistoryEntries = $this->table('reservation_history', ['signed' => true]);
        $reservationHistoryEntries
            ->changeColumn('type', 'enum', [
                'values' => [
                    'create',
                    'approve',
                    'add-material',
                    'update-material',
                    'remove-material',
                    'create-estimate',
                    'create-invoice',
                    'finish-departure-inventory',
                    'cancel-departure-inventory',
                    'finish-return-inventory',
                    'cancel-return-inventory',
                    'send-materials-list',
                    'archive',
                    'unarchive',
                ],
                'null' => false,
            ])
            ->update();
    }

    public function down(): void
    {
        $reservationHistoryEntries = $this->table('reservation_history', ['signed' => true]);
        $reservationHistoryEntries
            ->changeColumn('type', 'enum', [
                'values' => [
                    'create',
                    'approve',
                    'add-material',
                    'update-material',
                    'remove-material',
                    'create-invoice',
                    'finish-departure-inventory',
                    'cancel-departure-inventory',
                    'finish-return-inventory',
                    'cancel-return-inventory',
                    'send-materials-list',
                    'archive',
                    'unarchive',
                ],
                'null' => false,
            ])
            ->update();
    }
}
