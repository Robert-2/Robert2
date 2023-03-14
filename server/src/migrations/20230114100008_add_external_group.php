<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddExternalGroup extends AbstractMigration
{
    public function up(): void
    {
        $users = $this->table('users');
        $users
            ->changeColumn('group', 'enum', [
                'values' => ['external', 'visitor', 'member', 'admin'],
                'null' => false,
            ])
            ->save();
    }

    public function down(): void
    {
        $users = $this->table('users');
        $users
            ->changeColumn('group', 'enum', [
                'values' => ['visitor', 'member', 'admin'],
                'null' => false,
            ])
            ->save();
    }
}
