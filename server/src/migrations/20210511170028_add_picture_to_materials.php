<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddPictureToMaterials extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('materials');
        $table
            ->addColumn('picture', 'string', [
                'length' => 191,
                'null' => true,
                'after' => 'is_discountable',
            ])
            ->save();
    }

    public function down(): void
    {
        $table = $this->table('materials');
        $table
            ->removeColumn('picture')
            ->save();
    }
}
