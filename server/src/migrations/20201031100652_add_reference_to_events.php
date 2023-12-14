<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddReferenceToEvents extends AbstractMigration
{
    public function up(): void
    {
        $events = $this->table('events');
        $events
            ->addColumn('reference', 'string', [
                'length' => 64,
                'null' => true,
                'after' => 'description',
            ])
            ->addIndex(['reference'], [
                'unique' => true,
                'name' => 'reference_UNIQUE',
            ])
            ->update();
    }

    public function down(): void
    {
        $events = $this->table('events');
        $events
            ->removeColumn('reference')
            ->update();
    }
}
