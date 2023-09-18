<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddParkIdInMaterialUnit extends AbstractMigration
{
    public function up(): void
    {
        $material_units = $this->table('material_units');
        $material_units
            ->addColumn('park_id', 'integer', [
                'signed' => true,
                'null' => false,
                'after' => 'serial_number',
            ])
            ->addForeignKey('park_id', 'parks', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_unit_park',
            ])
            ->save();
    }

    public function down(): void
    {
        $material_units = $this->table('material_units');
        $material_units->dropForeignKey('park_id')->update();
        $material_units->removeColumn('park_id')->update();
    }
}
