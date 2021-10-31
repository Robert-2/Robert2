<?php
use Phinx\Migration\AbstractMigration;

class ChangeSubCategoriesUnicityConstraint extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('sub_categories');
        $table
            ->removeIndex(['name'])
            ->addIndex(['name', 'category_id'], [
                'unique' => true,
                'name'   => 'name_UNIQUE_category'
            ])
            ->update();
    }

    public function down()
    {
        $table = $this->table('sub_categories');
        $table
        ->removeIndex(['name', 'category_id'])
            ->addIndex(['name'], [
                'unique' => true,
                'name'   => 'name_UNIQUE'
            ])
            ->update();
    }
}
