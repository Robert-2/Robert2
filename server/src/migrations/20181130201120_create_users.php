<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateUsers extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('users', ['signed' => true]);
        $table
            ->addColumn('pseudo', 'string', ['length' => 100, 'null' => false])
            ->addColumn('email', 'string', ['length' => 191, 'null' => false])
            ->addColumn('group', 'integer', ['length' => 2, 'null' => false])
            ->addColumn('password', 'string', ['length' => 191, 'null' => false])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['pseudo'], [
                'unique' => true,
                'name' => 'pseudo_UNIQUE',
            ])
            ->addIndex(['email'], [
                'unique' => true,
                'name' => 'email_UNIQUE',
            ])
            ->create();
    }

    public function down()
    {
        $this->table('users')->drop()->save();
    }
}
