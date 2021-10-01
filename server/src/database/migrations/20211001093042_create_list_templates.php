<?php
use Phinx\Migration\AbstractMigration;

class CreateListTemplates extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('list_templates');
        $table
            ->addColumn('name', 'string', ['length' => 256])
            ->addColumn('description', 'text', ['null' => true])
            ->addColumn('user_id', 'integer', ['null' => true])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['user_id'])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_list_template_user'
            ])
            ->create();

        $table = $this->table('list_template_materials');
        $table
            ->addColumn('list_template_id', 'integer')
            ->addColumn('material_id', 'integer')
            ->addColumn('quantity', 'integer', ['signed' => false, 'limit' => 6])
            ->addIndex(['list_template_id'])
            ->addForeignKey('list_template_id', 'list_templates', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_list_template_materials_list_template'
            ])
            ->addIndex(['material_id'])
            ->addForeignKey('material_id', 'materials', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_list_template_materials_material'
            ])
            ->create();

        $table = $this->table('list_template_material_units');
        $table
            ->addColumn('list_template_material_id', 'integer')
            ->addColumn('material_unit_id', 'integer')
            ->addIndex(['list_template_material_id', 'material_unit_id'], ['unique' => true])
            ->addIndex(['list_template_material_id'])
            ->addForeignKey('list_template_material_id', 'list_template_materials', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_list_template_material_unit_list_template_material',
            ])
            ->addIndex(['material_unit_id'])
            ->addForeignKey('material_unit_id', 'material_units', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_list_template_material_unit_material_unit',
            ])
            ->create();
    }

    public function down()
    {
        $this->table('list_template_material_units')->drop()->save();
        $this->table('list_template_materials')->drop()->save();
        $this->table('list_templates')->drop()->save();
    }
}
