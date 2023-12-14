<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateMaterialAttributes extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('attributes', ['signed' => true]);
        $table
            ->addColumn('name', 'string', ['length' => 64, 'null' => false])
            ->addColumn('type', 'enum', [
                'values' => ['string', 'integer', 'float', 'boolean'],
                'null' => false,
            ])
            ->addColumn('unit', 'string', [
                'null' => true,
                'length' => 8,
            ])
            ->addColumn('max_length', 'integer', ['null' => true])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->create();

        $table = $this->table('material_attributes', ['signed' => true]);
        $table
            ->addColumn('material_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('attribute_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('value', 'text', ['null' => true])
            ->addIndex(['attribute_id'])
            ->addIndex(['material_id'])
            ->addForeignKey('material_id', 'materials', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_attributes_material',
            ])
            ->addForeignKey('attribute_id', 'attributes', 'id', [
                'delete' => 'NO_ACTION',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_attributes_attribute',
            ])
            ->create();
    }

    public function down(): void
    {
        $this->table('material_attributes')->drop()->save();
        $this->table('attributes')->drop()->save();
    }
}
