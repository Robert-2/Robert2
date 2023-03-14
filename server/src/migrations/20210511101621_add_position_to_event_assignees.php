<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddPositionToEventAssignees extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('event_assignees');
        $table
            ->addColumn('position', 'string', ['null' => true, 'length' => 191])
            ->save();
    }

    public function down()
    {
        $table = $this->table('event_assignees');
        $table
            ->removeColumn('position')
            ->save();
    }
}
