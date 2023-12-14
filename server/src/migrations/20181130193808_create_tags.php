<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTags extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('tags', ['signed' => true]);
        $table
            ->addColumn('name', 'string', ['length' => 48, 'null' => true])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['name'], [
                'unique' => true,
                'name' => 'name_UNIQUE',
            ])
            ->create();
    }

    public function down(): void
    {
        $this->table('tags')->drop()->save();
    }
}
