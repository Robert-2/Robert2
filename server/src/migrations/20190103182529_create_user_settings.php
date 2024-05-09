<?php
declare(strict_types=1);

use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class CreateUserSettings extends AbstractMigration
{
    public function up(): void
    {
        $userSettings = $this->table('user_settings', ['signed' => true]);
        $userSettings
            ->addColumn('user_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('language', 'char', [
                'limit' => 2,
                'default' => 'en',
                'null' => false,
            ])
            ->addColumn('auth_token_validity_duration', 'integer', [
                'default' => 12,
                'null' => false,
            ])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addIndex(['user_id'], ['unique' => true])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_user_settings_users',
            ])
            ->create();

        $prefix = Config::get('db.prefix');
        $users = $this->fetchAll(sprintf('SELECT * FROM `%susers`', $prefix));
        $now = date('Y-m-d H:i:s');
        foreach (array_column($users, 'id') as $userId) {
            $userSettings->insert([
                'user_id' => $userId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        $userSettings->saveData();
    }

    public function down(): void
    {
        $this->table('user_settings')->drop()->save();
    }
}
