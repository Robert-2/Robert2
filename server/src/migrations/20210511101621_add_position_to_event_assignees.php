<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddPositionToEventAssignees extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('event_assignees');
        $table
            ->addColumn('position', 'string', ['null' => true, 'length' => 191])
            ->save();
    }

    public function down(): void
    {
        $table = $this->table('event_assignees');
        $table
            ->removeColumn('position')
            ->save();
    }
}
