<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateMaterials extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('materials', ['signed' => true]);
        $table
            ->addColumn('name', 'string', ['length' => 191, 'null' => false])
            ->addColumn('description', 'text', ['null' => true])
            ->addColumn('reference', 'string', ['length' => 64, 'null' => false])
            ->addColumn('park_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('category_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('sub_category_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('rental_price', 'decimal', ['precision' => 8, 'scale' => 2, 'null' => false])
            ->addColumn('stock_quantity', 'integer', ['length' => 5, 'null' => false])
            ->addColumn('out_of_order_quantity', 'integer', ['length' => 5, 'null' => true])
            ->addColumn('replacement_price', 'decimal', ['precision' => 8, 'scale' => 2, 'null' => true])
            ->addColumn('serial_number', 'string', ['length' => 64, 'null' => true])
            ->addColumn('is_hidden_on_bill', 'boolean', ['default' => false, 'null' => false])
            ->addColumn('note', 'text', ['null' => true])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['name'])
            ->addIndex(['reference'], [
                'unique' => true,
                'name' => 'reference_UNIQUE',
            ])
            ->addIndex(['park_id'])
            ->addIndex(['category_id'])
            ->addIndex(['sub_category_id'])
            ->addForeignKey('park_id', 'parks', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_materials_park',
            ])
            ->addForeignKey('category_id', 'categories', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_materials_category',
            ])
            ->addForeignKey('sub_category_id', 'sub_categories', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_materials_subcategory',
            ])
            ->create();
    }

    public function down()
    {
        $this->table('materials')->drop()->save();
    }
}
