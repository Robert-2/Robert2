<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddReturnQuantitiesToEventMaterials extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('event_materials');
        $table
            ->addColumn('quantity_returned', 'integer', [
                'after' => 'quantity',
                'null' => false,
                'signed' => true,
                'limit' => 6,
                'default' => 0,
            ])
            ->addColumn('quantity_broken', 'integer', [
                'after' => 'quantity_returned',
                'null' => false,
                'signed' => true,
                'limit' => 6,
                'default' => 0,
            ])
            ->save();
    }

    public function down()
    {
        $table = $this->table('event_materials');
        $table
            ->removeColumn('quantity_returned')
            ->removeColumn('quantity_broken')
            ->save();
    }
}
