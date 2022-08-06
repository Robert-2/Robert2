<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class RemovesGroupsTable extends AbstractMigration
{
    public function up(): void
    {
        $users = $this->table('users');

        $users
            ->dropForeignKey('group_id', 'fk_users_group')
            ->removeIndex('group_id')
            ->save();

        $users
            ->renameColumn('group_id', 'group')
            ->save();

        $users
            ->changeColumn('group', 'enum', [
                'values' => ['visitor', 'member', 'admin'],
            ])
            ->addIndex(['group'])
            ->save();

        $this->table('groups')->drop()->save();
    }

    public function down(): void
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

        $users
            ->removeIndex(['group'])
            ->save();

        $users = $this->table('users');
        $users
            ->renameColumn('group', 'group_id')
            ->save();

        $users
            ->changeColumn('group_id', 'string', ['length' => 16])
            ->save();

        $users
            ->addIndex(['group_id'])
            ->addForeignKey('group_id', 'groups', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_users_group'
            ])
            ->save();
    }
}
