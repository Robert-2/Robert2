<?php
use Phinx\Migration\AbstractMigration;

class CreateUsers extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('users');
        $table
            ->addColumn('pseudo', 'string', ['length' => 100])
            ->addColumn('email', 'string', ['length' => 191])
            ->addColumn('group', 'integer', ['length' => 2])
            ->addColumn('password', 'string', ['length' => 191])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['pseudo'], [
                'unique' => true,
                'name'   => 'pseudo_UNIQUE'
            ])
            ->addIndex(['email'], [
                'unique' => true,
                'name'   => 'email_UNIQUE'
            ])
            ->create();
    }

    public function down()
    {
        $this->table('users')->drop()->save();
    }
}
