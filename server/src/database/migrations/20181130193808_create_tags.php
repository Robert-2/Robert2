<?php
// phpcs:disable PSR1.Classes.ClassDeclaration.MissingNamespace

use Phinx\Migration\AbstractMigration;

class CreateTags extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('tags');
        $table
            ->addColumn('name', 'string', ['length' => 48, 'null' => true])
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
        $this->table('tags')->drop()->save();
    }
}

// phpcs:enable
