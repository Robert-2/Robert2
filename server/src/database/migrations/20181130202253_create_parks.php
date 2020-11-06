<?php
use Phinx\Migration\AbstractMigration;

class CreateParks extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('parks');
        $table
            ->addColumn('name', 'string', ['length' => 96])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['name'], [
                'unique' => true,
                'name'   => 'name_UNIQUE'
            ])
            ->create();
    }

    public function down()
    {
        $this->table('parks')->drop()->save();
    }
}
