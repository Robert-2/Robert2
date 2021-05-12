<?php
use Phinx\Migration\AbstractMigration;

class AddPictureToMaterials extends AbstractMigration
{
    public function up()
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

    public function down()
    {
        $table = $this->table('materials');
        $table
            ->removeColumn('picture')
            ->save();
    }
}
