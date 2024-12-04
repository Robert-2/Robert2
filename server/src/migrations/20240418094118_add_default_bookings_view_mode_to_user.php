<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddDefaultBookingsViewModeToUser extends AbstractMigration
{
    public function up(): void
    {
        $users = $this->table('users');
        $users
            ->addColumn('default_bookings_view', 'enum', [
                'values' => ['calendar', 'listing'],
                'after' => 'language',
                'default' => 'calendar',
            ])
            ->update();
    }

    public function down(): void
    {
        $users = $this->table('users');
        $users
            ->removeColumn('default_bookings_view')
            ->update();
    }
}
