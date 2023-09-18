<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddAttributesCategoriesRelation extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('attribute_categories', ['signed' => true]);
        $table
            ->addColumn('attribute_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('category_id', 'integer', ['signed' => true, 'null' => false])
            ->addIndex(['attribute_id'])
            ->addForeignKey('attribute_id', 'attributes', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_attribute_categories_attribute',
            ])
            ->addIndex(['category_id'])
            ->addForeignKey('category_id', 'categories', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_attribute_categories_category',
            ])
            ->create();
    }

    public function down(): void
    {
        $this->table('attribute_categories')->drop()->save();
    }
}
