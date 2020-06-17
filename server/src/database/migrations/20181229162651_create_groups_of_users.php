<?php
// phpcs:disable PSR1.Classes.ClassDeclaration.MissingNamespace

use Phinx\Migration\AbstractMigration;

use Robert2\API\Config as Config;

class CreateGroupsOfUsers extends AbstractMigration
{
    public function up()
    {
        $groups = $this->table('groups', ['id' => false, 'primary_key' => 'id']);
        $groups
            ->addColumn('id', 'string', ['length' => 16])
            ->addColumn('name', 'string', ['length' => 32])
            ->create();

        $dataGroups = [
            ['id' => 'admin', 'name' => "Admin"],
            ['id' => 'member', 'name' => "Member"],
            ['id' => 'visitor', 'name' => "Visitor"],
        ];
        $groups->insert($dataGroups)->save();

        $users = $this->table('users');
        $users->renameColumn('group', 'group_id')->save();
        $users->changeColumn('group_id', 'string', ['length' => 16])->save();

        $prefix = Config\Config::getSettings('db')['prefix'];

        $this->execute(sprintf(
            "UPDATE `%susers` SET `group_id` = 'admin' WHERE `group_id` = '1'",
            $prefix
        ));
        $this->execute(sprintf(
            "UPDATE `%susers` SET `group_id` = 'member' WHERE `group_id` = '2'",
            $prefix
        ));

        $users
            ->addIndex(['group_id'])
            ->addForeignKey('group_id', 'groups', 'id', [
                'delete'     => 'RESTRICT',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_users_group'
            ])
            ->save();
    }

    public function down()
    {
        $users = $this->table('users');
        $users
            ->dropForeignKey('group_id')
            ->removeIndex(['group_id'])
            ->save();

        $prefix = Config\Config::getSettings('db')['prefix'];

        $this->execute(sprintf(
            "UPDATE `%susers` SET `group_id` = '1' WHERE `group_id` = 'admin'",
            $prefix
        ));
        $this->execute(sprintf(
            "UPDATE `%susers` SET `group_id` = '2' WHERE `group_id` = 'member'",
            $prefix
        ));

        $users->changeColumn('group_id', 'integer')->save();
        $users->renameColumn('group_id', 'group')->save();

        $this->table('groups')->drop()->save();
    }
}

// phpcs:enable
