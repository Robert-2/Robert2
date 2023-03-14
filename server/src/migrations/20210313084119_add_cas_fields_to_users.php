<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddCasFieldsToUsers extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('users');
        $table
            ->addColumn('cas_identifier', 'string', [
                'after' => 'password',
                'null' => true,
            ])
            ->addIndex('cas_identifier', [
                'unique' => true,
                'name' => 'user_cas_identifier_UNIQUE',
            ])
            ->save();
    }

    public function down()
    {
        $table = $this->table('users');
        $table
            ->removeColumn('cas_identifier')
            ->save();
    }
}
