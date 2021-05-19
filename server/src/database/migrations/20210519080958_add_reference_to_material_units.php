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

        $units = $this->fetchAll("SELECT `id`, `reference` FROM `material_units`");
        foreach ($units as $unit) {
            $this->execute(sprintf(
                "UPDATE `material_units` SET `serial_number` = '%s' WHERE `id` = %d",
                $unit['reference'],
                $unit['id']
            ));
        }
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
