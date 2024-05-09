<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddDefaultBookingsViewModeToUser extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('users');
        $table
            ->addColumn('default_bookings_view', 'enum', [
                'values' => ['calendar', 'listing'],
                'after' => 'language',
                'default' => 'calendar',
            ])
            ->save();
    }

    public function down(): void
    {
        $table = $this->table('users');
        $table
            ->removeColumn('default_bookings_view')
            ->save();
    }
}
