<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class FixTaggablesPrimaryConstraint extends AbstractMigration
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
