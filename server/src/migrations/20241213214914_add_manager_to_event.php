<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddManagerToEvent extends AbstractMigration
{
    public function up(): void
    {
        $events = $this->table('events');
        $events
            ->addColumn('manager_id', 'integer', [
                'signed' => true,
                'null' => true,
                'after' => 'preparer_id',
            ])
            ->addIndex(['manager_id'])
            ->addForeignKey('manager_id', 'users', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__events__manager',
            ])
            ->update();
    }

    public function down(): void
    {
        $events = $this->table('events');
        $events
            ->dropForeignKey('manager_id')
            ->save();
        $events
            ->removeColumn('manager_id')
            ->update();
    }
}
