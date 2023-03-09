<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddIsReturnedToEventMaterialUnits extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('event_material_units');
        $table
            ->addColumn('is_returned', 'boolean', [
                'null' => false,
                'default' => false,
                'after' => 'material_unit_id',
            ])
            ->addColumn('is_returned_broken', 'boolean', [
                'null' => false,
                'default' => false,
                'after' => 'is_returned',
            ])
            ->save();
    }

    public function down()
    {
        $table = $this->table('event_material_units');
        $table
            ->removeColumn('is_returned')
            ->removeColumn('is_returned_broken')
            ->save();
    }
}
