<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddReferenceToMaterialUnits extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('material_units');
        $table
            ->renameColumn('serial_number', 'reference')
            ->save();

        $table
            ->addColumn('serial_number', 'string', [
                'length' => 64,
                'null' => true,
                'after' => 'reference',
            ])
            ->save();
    }

    public function down(): void
    {
        $table = $this->table('material_units');
        $table
            ->removeColumn('serial_number')
            ->save();

        $table
            ->renameColumn('reference', 'serial_number')
            ->save();
    }
}
