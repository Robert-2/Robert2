<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class FixTaggablesPrimaryConstraint extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('taggables');
        $table
            ->changePrimaryKey(['tag_id', 'taggable_type', 'taggable_id'])
            ->save();
    }

    public function down(): void
    {
        $table = $this->table('taggables');
        $table
            ->changePrimaryKey(['tag_id', 'taggable_id'])
            ->save();
    }
}
