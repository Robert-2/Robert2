<?php
// phpcs:disable PSR1.Classes.ClassDeclaration.MissingNamespace

use Phinx\Migration\AbstractMigration;

class CreateCountries extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('countries');
        $table
            ->addColumn('name', 'string', ['length' => 96])
            ->addColumn('code', 'string', ['length' => 4])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['name'], [
                'unique' => true,
                'name'   => 'name_UNIQUE'
            ])
            ->addIndex(['code'], [
                'unique' => true,
                'name'   => 'code_UNIQUE'
            ])
            ->create();
    }

    public function down()
    {
        $this->table('countries')->drop()->save();
    }
}

// phpcs:enable
