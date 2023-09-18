<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateEvents extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('events', ['signed' => true]);
        $table
            ->addColumn('user_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('title', 'string', ['length' => 191, 'null' => false])
            ->addColumn('description', 'string', ['length' => 255, 'null' => true])
            ->addColumn('start_date', 'datetime', ['null' => false])
            ->addColumn('end_date', 'datetime', ['null' => false])
            ->addColumn('is_confirmed', 'boolean', ['default' => false, 'null' => false])
            ->addColumn('location', 'string', ['length' => 64, 'null' => false])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['user_id'])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_events_users',
            ])
            ->create();

        $table = $this->table('event_materials', ['signed' => true]);
        $table
            ->addColumn('event_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('material_id', 'integer', ['signed' => true, 'null' => false])
            ->addIndex(['event_id'])
            ->addForeignKey('event_id', 'events', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_event_materials_event',
            ])
            ->addIndex(['material_id'])
            ->addForeignKey('material_id', 'materials', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_event_materials_material',
            ])
            ->create();

        $table = $this->table('event_assignees', ['signed' => true]);
        $table
            ->addColumn('event_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('person_id', 'integer', ['signed' => true, 'null' => false])
            ->addIndex(['event_id'])
            ->addForeignKey('event_id', 'events', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_event_assignees_event',
            ])
            ->addIndex(['person_id'])
            ->addForeignKey('person_id', 'persons', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_event_assignees_person',
            ])
            ->create();

        $table = $this->table('event_beneficiaries', ['signed' => true]);
        $table
            ->addColumn('event_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('person_id', 'integer', ['signed' => true, 'null' => false])
            ->addIndex(['event_id'])
            ->addForeignKey('event_id', 'events', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_event_beneficiaries_event',
            ])
            ->addIndex(['person_id'])
            ->addForeignKey('person_id', 'persons', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_event_beneficiaries_person',
            ])
            ->create();
    }

    public function down(): void
    {
        $this->table('event_beneficiaries')->drop()->save();
        $this->table('event_assignees')->drop()->save();
        $this->table('event_materials')->drop()->save();
        $this->table('events')->drop()->save();
    }
}
