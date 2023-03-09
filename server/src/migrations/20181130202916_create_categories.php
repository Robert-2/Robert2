<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateCategories extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('categories', ['signed' => true]);
        $table
            ->addColumn('name', 'string', ['length' => 96, 'null' => false])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['name'], [
                'unique' => true,
                'name' => 'name_UNIQUE',
            ])
            ->create();

        $table = $this->table('sub_categories', ['signed' => true]);
        $table
            ->addColumn('name', 'string', ['length' => 96, 'null' => false])
            ->addColumn('category_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['category_id'])
            ->addIndex(['name'], [
                'unique' => true,
                'name' => 'name_UNIQUE',
            ])
            ->addForeignKey('category_id', 'categories', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_subcategory_category',
            ])
            ->create();
    }

    public function down()
    {
        $this->table('sub_categories')->drop()->save();
        $this->table('categories')->drop()->save();
    }
}
