<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class NormalizeEventTechnicianPeriod extends AbstractMigration
{
    public function up(): void
    {
        $event_technicians = $this->table('event_technicians');
        $event_technicians
            ->renameColumn('start_time', 'start_date')
            ->renameColumn('end_time', 'end_date')
            ->update();
    }

    public function down(): void
    {
        $event_technicians = $this->table('event_technicians');
        $event_technicians
            ->renameColumn('start_date', 'start_time')
            ->renameColumn('end_date', 'end_time')
            ->update();
    }
}
