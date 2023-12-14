<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddIsArchivedToEvents extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('events');
        $table
            ->addColumn('is_archived', 'boolean', [
                'after' => 'is_confirmed',
                'null' => false,
                'default' => false,
            ])
            ->save();
    }

    public function down(): void
    {
        $events = $this->table('events');
        $events
            ->removeColumn('is_archived')
            ->save();
    }
}
