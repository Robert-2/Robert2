<?php
use Phinx\Migration\AbstractMigration;

class AddParkIdInMaterialUnit extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('material_units');
        $table
            ->addColumn('park_id', 'integer', ['after' => 'serial_number'])
            ->addForeignKey('park_id', 'parks', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_unit_park',
            ])
            ->save();
    }

    public function down()
    {
        $table = $this->table('material_units');
        $table
            ->removeColumn('park_id')
            ->save();
    }
}
