<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddOwnerToMaterialUnits extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('material_units');
        $table
            ->addColumn('person_id', 'integer', [
                'signed' => true,
                'null' => true,
                'after' => 'park_id',
            ])
            ->addIndex(['person_id'])
            ->addForeignKey('person_id', 'persons', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_units_person',
            ])
            ->save();
    }

    public function down()
    {
        $table = $this->table('material_units');
        $table
            ->dropForeignKey('person_id')
            ->removeColumn('person_id')
            ->save();
    }
}
