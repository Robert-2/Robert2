<?php
use Phinx\Migration\AbstractMigration;

class CreateMaterialUnitStates extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('material_unit_states');
        $table
            ->addColumn('name', 'string', ['length' => 64])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['name'], [
                'unique' => true,
                'name' => 'name_UNIQUE'
            ])
            ->create();
    }

    public function down()
    {
        $this->table('material_unit_states')->drop()->save();
    }
}
