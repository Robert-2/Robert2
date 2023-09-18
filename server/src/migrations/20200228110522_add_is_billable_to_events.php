<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddIsBillableToEvents extends AbstractMigration
{
    public function up(): void
    {
        $events = $this->table('events');
        $events
            ->addColumn('is_billable', 'boolean', [
                'after' => 'location',
                'default' => true,
                'null' => false,
            ])
            ->update();
    }

    public function down(): void
    {
        $events = $this->table('events');
        $events
            ->removeColumn('is_billable')
            ->update();
    }
}
