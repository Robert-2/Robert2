<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class ChangeEventDescriptionToText extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('events');
        $table
            ->changeColumn('description', 'text', ['null' => true])
            ->save();
    }

    public function down(): void
    {
        $table = $this->table('events');
        $table
            ->changeColumn('description', 'string', ['null' => true, 'length' => 255])
            ->save();
    }
}
