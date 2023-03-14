<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateListTemplates extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('list_templates', ['signed' => true]);
        $table
            ->addColumn('name', 'string', ['length' => 100, 'null' => false])
            ->addColumn('description', 'text', ['null' => true])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->create();

        $table = $this->table('list_template_materials', ['signed' => true]);
        $table
            ->addColumn('list_template_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('material_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('quantity', 'integer', [
                'signed' => true,
                'limit' => 6,
                'null' => false,
            ])
            ->addIndex(['list_template_id'])
            ->addForeignKey('list_template_id', 'list_templates', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_list_template_materials_list_template',
            ])
            ->addIndex(['material_id'])
            ->addForeignKey('material_id', 'materials', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_list_template_materials_material',
            ])
            ->create();

        $table = $this->table('list_template_material_units', ['signed' => true]);
        $table
            ->addColumn('list_template_material_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('material_unit_id', 'integer', ['signed' => true, 'null' => false])
            ->addIndex(['list_template_material_id', 'material_unit_id'], ['unique' => true])
            ->addIndex(['list_template_material_id'])
            ->addForeignKey('list_template_material_id', 'list_template_materials', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_list_template_material_unit_list_template_material',
            ])
            ->addIndex(['material_unit_id'])
            ->addForeignKey('material_unit_id', 'material_units', 'id', [
                'delete' => 'CASCADE',
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
