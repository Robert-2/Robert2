<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateInventories extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('inventories', ['signed' => true]);
        $table
            ->addColumn('date', 'datetime', ['null' => true])
            ->addColumn('park_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('is_tmp', 'boolean', ['default' => true, 'null' => false])
            ->addColumn('author_id', 'integer', ['signed' => true, 'null' => true])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addIndex(['author_id'])
            ->addForeignKey('author_id', 'users', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_inventory_user',
            ])
            ->addIndex(['park_id'])
            ->addForeignKey('park_id', 'parks', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_inventory_park',
            ])
            ->create();
    }

    public function down()
    {
        $this->table('inventories')->drop()->save();
    }
}
