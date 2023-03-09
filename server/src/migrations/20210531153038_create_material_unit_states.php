<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateMaterialUnitStates extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('material_unit_states', ['signed' => true]);
        $table
            ->addColumn('name', 'string', ['length' => 64, 'null' => false])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['name'], [
                'unique' => true,
                'name' => 'name_UNIQUE',
            ])
            ->create();
    }

    public function down()
    {
        $this->table('material_unit_states')->drop()->save();
    }
}
