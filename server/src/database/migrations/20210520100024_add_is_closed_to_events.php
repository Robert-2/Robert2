<?php
use Phinx\Migration\AbstractMigration;

class AddIsClosedToEvents extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('events');
        $table->addColumn('is_closed', 'boolean', [
            'after' => 'is_confirmed',
            'default' => false,
        ])->update();
    }

    public function down()
    {
        $events = $this->table('events');
        $events
            ->removeColumn('is_closed')
            ->update();
    }
}
