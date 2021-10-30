<?php
use Phinx\Migration\AbstractMigration;

class CreateUserRestrictedParks extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('user_restricted_parks');
        $table
            ->addColumn('user_id', 'integer')
            ->addColumn('park_id', 'integer')
            ->addIndex(['user_id'])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_user_restricted_parks_user'
            ])
            ->addIndex(['park_id'])
            ->addForeignKey('park_id', 'parks', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_user_restricted_parks_park'
            ])
            ->addIndex(['user_id', 'park_id'], [
                'unique' => true,
                'name' => 'user_restricted_park_UNIQUE'
            ])
            ->create();
    }

    public function down()
    {
        $this->table('user_restricted_parks')->drop()->save();
    }
}
