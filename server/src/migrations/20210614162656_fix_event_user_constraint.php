<?php
use Phinx\Migration\AbstractMigration;

class FixEventUserConstraint extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('events');

        $table->dropForeignKey('user_id')->save();

        $table
            ->changeColumn('user_id', 'integer', ['null' => true])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_events_users',
            ])
            ->save();
    }

    public function down()
    {
        $table = $this->table('events');

        $table->dropForeignKey('user_id')->save();

        $table
            ->changeColumn('user_id', 'integer', ['null' => false])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_events_users',
            ])
            ->save();
    }
}
