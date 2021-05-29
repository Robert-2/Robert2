<?php
use Phinx\Migration\AbstractMigration;

class AddIsArchivedToEvents extends AbstractMigration
{
    public function up()
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

    public function down()
    {
        $events = $this->table('events');
        $events
            ->removeColumn('is_archived')
            ->save();
    }
}
