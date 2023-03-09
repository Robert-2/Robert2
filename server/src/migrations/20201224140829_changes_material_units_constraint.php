<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class ChangesMaterialUnitsConstraint extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('event_material_units');
        $table->dropForeignKey('material_unit_id')->save();
        $table
            ->addForeignKey('material_unit_id', 'material_units', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_event_material_unit_material_unit',
            ])
            ->save();
    }

    public function down()
    {
        $table = $this->table('event_material_units');
        $table->dropForeignKey('material_unit_id')->save();
        $table
            ->addForeignKey('material_unit_id', 'material_units', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_event_material_unit_material_unit',
            ])
            ->save();
    }
}
