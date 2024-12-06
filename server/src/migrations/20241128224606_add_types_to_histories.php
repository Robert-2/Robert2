<?php
declare(strict_types=1);

use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class AddTypesToHistories extends AbstractMigration
{
    public function up(): void
    {
        $eventHistoryEntries = $this->table('event_history', ['signed' => true]);
        $eventHistoryEntries
            ->changeColumn('type', 'enum', [
                'values' => [
                    'create',
                    'update',
                    'confirm',
                    'unconfirm',
                    'assign-beneficiary',
                    'unassign-beneficiary',
                    'assign-technician',
                    'update-technician',
                    'unassign-technician',
                    'add-material',
                    'update-material',
                    'remove-material',
                    'create-estimate',
                    'create-invoice',
                    'finish-departure-inventory',
                    'cancel-departure-inventory',
                    'finish-return-inventory',
                    'cancel-return-inventory',
                    'duplicate',
                    'send-materials-list',
                    'send-release-sheet',
                    'add_extra',
                    'update_extra',
                    'remove_extra',
                    'archive',
                    'unarchive',
                ],
                'null' => false,
            ])
            ->update();

        $reservationHistoryEntries = $this->table('reservation_history', ['signed' => true]);
        $reservationHistoryEntries
            ->changeColumn('type', 'enum', [
                'values' => [
                    'create',
                    'update',
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
                    'add_extra',
                    'update_extra',
                    'remove_extra',
                    'archive',
                    'unarchive',
                ],
                'null' => false,
            ])
            ->update();
    }

    public function down(): void
    {
        $prefix = Config::get('db.prefix');

        $typesToRemove = ['update', 'add_extra', 'update_extra', 'remove_extra'];

        $this->execute(sprintf(
            "DELETE FROM `%sreservation_history` WHERE `type` IN ('%s')",
            $prefix,
            join("','", $typesToRemove),
        ));

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

        $typesToRemove = ['add_extra', 'update_extra', 'remove_extra'];

        $this->execute(sprintf(
            "DELETE FROM `%sevent_history` WHERE `type` IN ('%s')",
            $prefix,
            join("','", $typesToRemove),
        ));

        $eventHistoryEntries = $this->table('event_history', ['signed' => true]);
        $eventHistoryEntries
            ->changeColumn('type', 'enum', [
                'values' => [
                    'create',
                    'update',
                    'confirm',
                    'unconfirm',
                    'assign-beneficiary',
                    'unassign-beneficiary',
                    'assign-technician',
                    'update-technician',
                    'unassign-technician',
                    'add-material',
                    'update-material',
                    'remove-material',
                    'create-estimate',
                    'create-invoice',
                    'finish-departure-inventory',
                    'cancel-departure-inventory',
                    'finish-return-inventory',
                    'cancel-return-inventory',
                    'duplicate',
                    'send-materials-list',
                    'send-release-sheet',
                    'archive',
                    'unarchive',
                ],
                'null' => false,
            ])
            ->update();
    }
}
