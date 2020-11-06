<?php
use Phinx\Migration\AbstractMigration;

class CreateTaggables extends AbstractMigration
{
    public function up()
    {
        $taggables = $this->table('taggables', [
            'id'          => false,
            'primary_key' => ['tag_id', 'taggable_id']
        ]);
        $taggables
            ->addColumn('tag_id', 'integer')
            ->addColumn('taggable_type', 'string', ['length' => 128])
            ->addColumn('taggable_id', 'integer')
            ->addIndex(['tag_id'])
            ->addForeignKey('tag_id', 'tags', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_taggables_tags'
            ])
            ->create();

        $this->table('persons_tags')->drop()->save();
    }

    public function down()
    {
        $personsTags = $this->table('persons_tags', [
            'id'          => false,
            'primary_key' => ['person_id', 'tag_id']
        ]);
        $personsTags
            ->addColumn('person_id', 'integer')
            ->addColumn('tag_id', 'integer')
            ->addForeignKey('person_id', 'persons', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_personstags_persons'
            ])
            ->addForeignKey('tag_id', 'tags', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_personstags_tags'
            ])
            ->create();

        $this->table('taggables')->drop()->save();
    }
}
