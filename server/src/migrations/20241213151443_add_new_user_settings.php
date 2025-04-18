<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddNewUserSettings extends AbstractMigration
{
    public function up(): void
    {
        $users = $this->table('users');
        $users
            ->addColumn('default_technicians_view', 'enum', [
                'after' => 'default_bookings_view',
                'values' => ['listing', 'timeline'],
                'default' => 'listing',
                'null' => false,
            ])
            ->addColumn('disable_contextual_popovers', 'boolean', [
                'after' => 'default_technicians_view',
                'default' => false,
                'null' => false,
            ])
            ->addColumn('disable_search_persistence', 'boolean', [
                'after' => 'disable_contextual_popovers',
                'default' => false,
                'null' => false,
            ])
            ->update();
    }

    public function down(): void
    {
        $users = $this->table('users');
        $users
            ->removeColumn('default_technicians_view')
            ->removeColumn('disable_contextual_popovers')
            ->removeColumn('disable_search_persistence')
            ->update();
    }
}
