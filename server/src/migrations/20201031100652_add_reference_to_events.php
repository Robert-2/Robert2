<?php
// phpcs:disable PSR1.Classes.ClassDeclaration.MissingNamespace

use Phinx\Migration\AbstractMigration;

class AddReferenceToEvents extends AbstractMigration
{
    public function up()
    {
        $events = $this->table('events');
        $events
            ->addColumn('reference', 'string', [
                'length' => 64,
                'null' => true,
                'after' => 'description',
            ])
            ->addIndex(['reference'], [
                'unique' => true,
                'name'   => 'reference_UNIQUE'
            ])
            ->update();
    }

    public function down()
    {
        $events = $this->table('events');
        $events
            ->removeColumn('reference')
            ->update();
    }
}

// phpcs:enable
