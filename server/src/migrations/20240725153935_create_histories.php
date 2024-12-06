<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateHistories extends AbstractMigration
{
    public function up(): void
    {
        $eventHistoryEntries = $this->table('event_history', ['signed' => true]);
        $eventHistoryEntries
            ->addColumn('event_id', 'integer', [
                'signed' => true,
                'null' => false,
            ])
            ->addColumn('type', 'enum', [
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
            ->addColumn('date', 'datetime', ['null' => false])
            ->addColumn('author_id', 'integer', [
                'signed' => true,
                'null' => true, // - `null` correspond à "Système" ou "Utilisateur supprimé".
            ])
            ->addColumn('metadata', 'json', ['null' => true])
            ->addIndex(['event_id'])
            ->addForeignKey('event_id', 'events', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event_history_entry__event',
            ])
            ->addIndex(['author_id'])
            ->addForeignKey('author_id', 'users', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event_history_entry__author',
            ])
            ->create();

        $reservationHistoryEntries = $this->table('reservation_history', ['signed' => true]);
        $reservationHistoryEntries
            ->addColumn('reservation_id', 'integer', [
                'signed' => true,
                'null' => false,
            ])
            ->addColumn('type', 'enum', [
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
            ->addColumn('date', 'datetime', ['null' => false])
            ->addColumn('author_id', 'integer', [
                'signed' => true,
                'null' => true, // - `null` correspond à "Système" ou "Utilisateur supprimé".
            ])
            ->addColumn('metadata', 'json', ['null' => true])
            ->addIndex(['reservation_id'])
            ->addForeignKey('reservation_id', 'reservations', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__reservation_history_entry__reservation',
            ])
            ->addIndex(['author_id'])
            ->addForeignKey('author_id', 'users', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__reservation_history_entry__author',
            ])
            ->create();
    }

    public function down(): void
    {
        $this->table('reservation_history')->drop()->save();
        $this->table('event_history')->drop()->save();
    }
}
