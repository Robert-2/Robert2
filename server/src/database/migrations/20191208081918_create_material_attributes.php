<?php
// phpcs:disable PSR1.Classes.ClassDeclaration.MissingNamespace

use Phinx\Migration\AbstractMigration;

class CreateMaterialAttributes extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('attributes');
        $table
            ->addColumn('name', 'string', ['length' => 64])
            ->addColumn('type', 'enum', [
                'values' => ['string', 'integer', 'float', 'boolean']
            ])
            ->addColumn('unit', 'string', [
                'null' => true,
                'length' => 8
            ])
            ->addColumn('max_length', 'integer', ['null' => true])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->create();

        $table = $this->table('material_attributes');
        $table
            ->addColumn('material_id', 'integer')
            ->addColumn('attribute_id', 'integer')
            ->addColumn('value', 'text', ['null' => true])
            ->addIndex(['attribute_id'])
            ->addIndex(['material_id'])
            ->addForeignKey('material_id', 'materials', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_material_attributes_material'
            ])
            ->addForeignKey('attribute_id', 'attributes', 'id', [
                'delete'     => 'NO_ACTION',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_material_attributes_attribute'
            ])
            ->create();
    }

    public function down()
    {
        $this->table('material_attributes')->drop()->save();
        $this->table('attributes')->drop()->save();
    }
}

// phpcs:enable
