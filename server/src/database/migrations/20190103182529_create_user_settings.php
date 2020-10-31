<?php
use Phinx\Migration\AbstractMigration;

use Robert2\API\Config as Config;

class CreateUserSettings extends AbstractMigration
{
    public function up()
    {
        $userSettings = $this->table('user_settings');
        $userSettings
            ->addColumn('user_id', 'integer')
            ->addColumn('language', 'char', ['limit' => 2, 'default' => 'EN'])
            ->addColumn('auth_token_validity_duration', 'integer', ['default' => 12])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addIndex(['user_id'], ['unique' => true])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_user_settings_users'
            ])
            ->create();

        $prefix = Config\Config::getSettings('db')['prefix'];

        $users = $this->fetchAll(sprintf('SELECT * FROM `%susers`', $prefix));
        $now = date('Y-m-d H:i:s');
        foreach (array_column($users, 'id') as $userId) {
            $userSettings->insert([
                'user_id'    => $userId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        $userSettings->saveData();
    }

    public function down()
    {
        $this->table('user_settings')->drop()->save();
    }
}
