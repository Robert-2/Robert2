<?php
use Phinx\Migration\AbstractMigration;

class AddReferenceToMaterialUnits extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('material_units');
        $table
            ->renameColumn('serial_number', 'reference')
            ->save();

        $table
            ->addColumn('serial_number', 'string', [
                'length' => 64,
                'null' => true,
                'after' => 'reference'
            ])
            ->save();
    }

    public function down()
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
