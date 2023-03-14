<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class FixEventUserConstraint extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('events');

        $table->dropForeignKey('user_id')->save();

        $table
            ->changeColumn('user_id', 'integer', ['signed' => true, 'null' => true])
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
            ->changeColumn('user_id', 'integer', ['signed' => true, 'null' => false])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_events_users',
            ])
            ->save();
    }
}
