<?php
use Phinx\Migration\AbstractMigration;

class CreateInventories extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('inventories');
        $table
            ->addColumn('date', 'datetime', ['null' => true])
            ->addColumn('park_id', 'integer')
            ->addColumn('is_tmp', 'boolean', ['default' => true])
            ->addColumn('author_id', 'integer', ['null' => true])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addIndex(['author_id'])
            ->addForeignKey('author_id', 'users', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_inventory_user'
            ])
            ->addIndex(['park_id'])
            ->addForeignKey('park_id', 'parks', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_inventory_park'
            ])
            ->create();
    }

    public function down()
    {
        $this->table('inventories')->drop()->save();
    }
}
