<?php
use Phinx\Migration\AbstractMigration;

class RemovesMaterialsSerialNumber extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('materials');
        $table
            ->removeColumn('serial_number')
            ->save();
    }

    public function down()
    {
        $table = $this->table('materials');
        $table
            ->addColumn('serial_number', 'string', [
                'length' => 64,
                'null' => true,
                'after' => 'replacement_price'
            ])
            ->save();
    }
}
