<?php
use Phinx\Migration\AbstractMigration;

class FixTaggablesPrimaryConstraint extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('taggables');
        $table
            ->changePrimaryKey(['tag_id', 'taggable_type', 'taggable_id'])
            ->save();
    }

    public function down()
    {
        $table = $this->table('taggables');
        $table
            ->changePrimaryKey(['tag_id', 'taggable_id'])
            ->save();
    }
}
