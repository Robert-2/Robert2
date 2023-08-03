<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class RenameEventsUserToAuthor extends AbstractMigration
{
    public function up(): void
    {
        $events = $this->table('events');
        $events
            ->dropForeignKey('user_id')
            ->removeIndex(['user_id'])
            ->update();

        $events
            ->renameColumn('user_id', 'author_id')
            ->changeColumn('author_id', 'integer', [
                'signed' => true,
                'null' => true,
                'after' => 'note',
            ])
            ->addIndex(['author_id'])
            ->addForeignKey('author_id', 'users', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event__author',
            ])
            ->update();
    }

    public function down(): void
    {
        $events = $this->table('events');
        $events
            ->dropForeignKey('author_id')
            ->removeIndex(['author_id'])
            ->update();

        $events
            ->renameColumn('author_id', 'user_id')
            ->changeColumn('user_id', 'integer', [
                'signed' => true,
                'null' => true,
                'after' => 'id',
            ])
            ->addIndex(['user_id'])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_events_users',
            ])
            ->update();
    }
}
