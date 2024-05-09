<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateReminders extends AbstractMigration
{
    public function up(): void
    {
        //
        // - Events
        //

        $table = $this->table('event_reminders', ['signed' => true]);
        $table
            ->addColumn('event_id', 'integer', [
                'signed' => true,
                'null' => false,
            ])
            ->addColumn('date', 'datetime', [
                'null' => false,
            ])
            ->addIndex(['event_id'])
            ->addForeignKey('event_id', 'events', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event_reminders__event',
            ])
            ->create();

        $table = $this->table('event_reminder_recipients', ['signed' => true]);
        $table
            ->addColumn('event_reminder_id', 'integer', [
                'signed' => true,
                'null' => false,
            ])
            ->addColumn('beneficiary_email_id', 'integer', [
                'signed' => true,
                'null' => false,
            ])
            ->addIndex(['event_reminder_id'])
            ->addForeignKey('event_reminder_id', 'event_reminders', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event_reminder_recipients__event_reminder',
            ])
            ->addIndex(['beneficiary_email_id'])
            ->addForeignKey('beneficiary_email_id', 'beneficiary_emails', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event_reminder_recipients__beneficiary_email',
            ])
            ->create();

        //
        // - Reservations
        //

        $table = $this->table('reservation_reminders', ['signed' => true]);
        $table
            ->addColumn('reservation_id', 'integer', [
                'signed' => true,
                'null' => false,
            ])
            ->addColumn('date', 'datetime', [
                'null' => false,
            ])
            ->addIndex(['reservation_id'])
            ->addForeignKey('reservation_id', 'reservations', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__reservation_reminders__reservation',
            ])
            ->create();

        $table = $this->table('reservation_reminder_recipients', ['signed' => true]);
        $table
            ->addColumn('reservation_reminder_id', 'integer', [
                'signed' => true,
                'null' => false,
            ])
            ->addColumn('beneficiary_email_id', 'integer', [
                'signed' => true,
                'null' => false,
            ])
            ->addIndex(['reservation_reminder_id'])
            ->addForeignKey('reservation_reminder_id', 'reservation_reminders', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__reservation_reminder_recipients__reservation_reminder',
            ])
            ->addIndex(['beneficiary_email_id'])
            ->addForeignKey('beneficiary_email_id', 'beneficiary_emails', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__reservation_reminder_recipients__beneficiary_email',
            ])
            ->create();
    }

    public function down(): void
    {
        $this->table('event_reminder_recipients')->drop()->save();
        $this->table('reservation_reminder_recipients')->drop()->save();
        $this->table('reservation_reminders')->drop()->save();
        $this->table('event_reminders')->drop()->save();
    }
}
