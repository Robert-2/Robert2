<?php
declare(strict_types=1);

use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class CreateGroupsOfUsers extends AbstractMigration
{
    public function up(): void
    {
        $groups = $this->table('groups', ['id' => false, 'primary_key' => 'id']);
        $groups
            ->addColumn('id', 'string', ['length' => 16, 'null' => false])
            ->addColumn('name', 'string', ['length' => 32, 'null' => false])
            ->create();

        $dataGroups = [
            ['id' => 'admin', 'name' => "Admin"],
            ['id' => 'member', 'name' => "Member"],
            ['id' => 'visitor', 'name' => "Visitor"],
        ];
        $groups->insert($dataGroups)->save();

        $users = $this->table('users');
        $users->renameColumn('group', 'group_id')->save();
        $users
            ->changeColumn('group_id', 'string', ['length' => 16, 'null' => false])
            ->save();

        $prefix = Config::get('db.prefix');

        $this->execute(sprintf(
            "UPDATE `%susers` SET `group_id` = 'admin' WHERE `group_id` = '1'",
            $prefix,
        ));
        $this->execute(sprintf(
            "UPDATE `%susers` SET `group_id` = 'member' WHERE `group_id` = '2'",
            $prefix,
        ));

        $users
            ->addIndex(['group_id'])
            ->addForeignKey('group_id', 'groups', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_users_group',
            ])
            ->save();
    }

    public function down(): void
    {
        $users = $this->table('users');
        $users
            ->dropForeignKey('group_id')
            ->removeIndex(['group_id'])
            ->save();

        $prefix = Config::get('db.prefix');

        $this->execute(sprintf(
            "UPDATE `%susers` SET `group_id` = '1' WHERE `group_id` = 'admin'",
            $prefix,
        ));
        $this->execute(sprintf(
            "UPDATE `%susers` SET `group_id` = '2' WHERE `group_id` = 'member'",
            $prefix,
        ));

        $users
            ->changeColumn('group_id', 'integer', [
                'signed' => true,
                'null' => false,
            ])
            ->save();
        $users->renameColumn('group_id', 'group')->save();

        $this->table('groups')->drop()->save();
    }
}
