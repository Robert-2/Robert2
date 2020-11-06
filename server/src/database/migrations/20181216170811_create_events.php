<?php
use Phinx\Migration\AbstractMigration;

class CreateEvents extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('events');
        $table
            ->addColumn('user_id', 'integer')
            ->addColumn('title', 'string', ['length' => 191])
            ->addColumn('description', 'string', ['length' => 255, 'null' => true])
            ->addColumn('start_date', 'datetime')
            ->addColumn('end_date', 'datetime')
            ->addColumn('is_confirmed', 'boolean', ['default' => false])
            ->addColumn('location', 'string', ['length' => 64])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['user_id'])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete'     => 'RESTRICT',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_events_users'
            ])
            ->create();

        $table = $this->table('event_materials');
        $table
            ->addColumn('event_id', 'integer')
            ->addColumn('material_id', 'integer')
            ->addIndex(['event_id'])
            ->addForeignKey('event_id', 'events', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_event_materials_event'
            ])
            ->addIndex(['material_id'])
            ->addForeignKey('material_id', 'materials', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_event_materials_material'
            ])
            ->create();

        $table = $this->table('event_assignees');
        $table
            ->addColumn('event_id', 'integer')
            ->addColumn('person_id', 'integer')
            ->addIndex(['event_id'])
            ->addForeignKey('event_id', 'events', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_event_assignees_event'
            ])
            ->addIndex(['person_id'])
            ->addForeignKey('person_id', 'persons', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_event_assignees_person'
            ])
            ->create();

        $table = $this->table('event_beneficiaries');
        $table
            ->addColumn('event_id', 'integer')
            ->addColumn('person_id', 'integer')
            ->addIndex(['event_id'])
            ->addForeignKey('event_id', 'events', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_event_beneficiaries_event'
            ])
            ->addIndex(['person_id'])
            ->addForeignKey('person_id', 'persons', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_event_beneficiaries_person'
            ])
            ->create();
    }

    public function down()
    {
        $this->table('event_beneficiaries')->drop()->save();
        $this->table('event_assignees')->drop()->save();
        $this->table('event_materials')->drop()->save();
        $this->table('events')->drop()->save();
    }
}
