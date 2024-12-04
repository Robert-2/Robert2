<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class MiscFixes extends AbstractMigration
{
    public function up(): void
    {
        // - `default_bookings_view` ne devrait pas être nullable.
        $users = $this->table('users');
        $users
            ->changeColumn('default_bookings_view', 'enum', [
                'values' => ['calendar', 'listing'],
                'default' => 'calendar',
                'null' => false,
            ])
            ->update();
    }

    public function down(): void
    {
        $users = $this->table('users');
        $users
            ->changeColumn('default_bookings_view', 'enum', [
                'values' => ['calendar', 'listing'],
                'default' => 'calendar',
                'null' => true,
            ])
            ->update();
    }
}
