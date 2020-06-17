<?php
// phpcs:disable PSR1.Classes.ClassDeclaration.MissingNamespace

use Phinx\Migration\AbstractMigration;

class AddIsBillableToEvents extends AbstractMigration
{
    public function up()
    {
        $events = $this->table('events');
        $events
            ->addColumn('is_billable', 'boolean', [
                'after'   => 'location',
                'default' => true,
            ])
            ->update();
    }

    public function down()
    {
        $events = $this->table('events');
        $events
            ->removeColumn('is_billable')
            ->update();
    }
}

// phpcs:enable
