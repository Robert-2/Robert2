<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class RemovesMaterialsSerialNumber extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('materials');
        $table
            ->removeColumn('serial_number')
            ->save();
    }

    public function down(): void
    {
        $table = $this->table('materials');
        $table
            ->addColumn('serial_number', 'string', [
                'length' => 64,
                'null' => true,
                'after' => 'replacement_price',
            ])
            ->save();
    }
}
