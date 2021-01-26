<?php
use Phinx\Migration\AbstractMigration;

class AddAttributesCategoriesRelation extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('attribute_categories');
        $table
            ->addColumn('attribute_id', 'integer')
            ->addColumn('category_id', 'integer')
            ->addIndex(['attribute_id'])
            ->addForeignKey('attribute_id', 'attributes', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_attribute_categories_attribute'
            ])
            ->addIndex(['category_id'])
            ->addForeignKey('category_id', 'categories', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_attribute_categories_category'
            ])
            ->create();
    }

    public function down()
    {
        $this->table('attribute_categories')->drop()->save();
    }
}
