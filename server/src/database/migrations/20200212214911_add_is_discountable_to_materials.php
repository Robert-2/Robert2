<?php
use Phinx\Migration\AbstractMigration;

class AddIsDiscountableToMaterials extends AbstractMigration
{
    public function up()
    {
        $materials = $this->table('materials');
        $materials
            ->addColumn('is_discountable', 'boolean', [
                'after'   => 'is_hidden_on_bill',
                'default' => true,
            ])
            ->update();
    }

    public function down()
    {
        $materials = $this->table('materials');
        $materials
            ->removeColumn('is_discountable')
            ->update();
    }
}
