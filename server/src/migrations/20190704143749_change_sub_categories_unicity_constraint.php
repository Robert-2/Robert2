<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class ChangeSubCategoriesUnicityConstraint extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('sub_categories');
        $table
            ->removeIndex(['name'])
            ->addIndex(['name', 'category_id'], [
                'unique' => true,
                'name' => 'name_UNIQUE_category',
            ])
            ->update();
    }

    public function down(): void
    {
        $table = $this->table('sub_categories');
        $table
            ->removeIndex(['name', 'category_id'])
            ->addIndex(['name'], [
                'unique' => true,
                'name' => 'name_UNIQUE',
            ])
            ->update();
    }
}
