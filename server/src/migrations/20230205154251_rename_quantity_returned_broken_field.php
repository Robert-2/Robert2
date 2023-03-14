<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class RenameQuantityReturnedBrokenField extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('event_materials');
        $table->renameColumn('quantity_broken', 'quantity_returned_broken')->save();
    }

    public function down(): void
    {
        $table = $this->table('event_materials');
        $table->renameColumn('quantity_returned_broken', 'quantity_broken')->save();
    }
}
