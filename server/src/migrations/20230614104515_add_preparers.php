<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddPreparers extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('technicians');
        $table
            ->addColumn('is_preparer', 'boolean', [
                'null' => false,
                'default' => false,
                'after' => 'nickname',
            ])
            ->update();

        $table = $this->table('events');
        $table
            ->addColumn('preparer_id', 'integer', [
                'signed' => true,
                'null' => true,
                'after' => 'end_date',
            ])
            ->addIndex(['preparer_id'])
            ->addForeignKey('preparer_id', 'technicians', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__events__preparer',
            ])
            ->update();
    }

    public function down(): void
    {
        $events = $this->table('events');
        $events
            ->dropForeignKey('preparer_id')
            ->save();
        $events
            ->removeColumn('preparer_id')
            ->update();

        $this->table('technicians')
            ->removeColumn('is_preparer')
            ->update();
    }
}
