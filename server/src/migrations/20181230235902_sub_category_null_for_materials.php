<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class SubCategoryNullForMaterials extends AbstractMigration
{
    public function up()
    {
        $materials = $this->table('materials');
        $materials
            ->changeColumn('sub_category_id', 'integer', ['signed' => true, 'null' => true])
            ->dropForeignKey('sub_category_id')
            ->save();

        $materials
            ->addForeignKey('sub_category_id', 'sub_categories', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_materials_subcategory',
            ])
            ->save();
    }

    public function down()
    {
        $materials = $this->table('materials');
        $materials
            ->dropForeignKey('sub_category_id')
            ->save();

        $materials
            ->changeColumn('sub_category_id', 'integer', ['signed' => true, 'null' => false])
            ->addForeignKey('sub_category_id', 'sub_categories', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_materials_subcategory',
            ])
            ->save();
    }
}
