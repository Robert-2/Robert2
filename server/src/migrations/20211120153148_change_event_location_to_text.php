<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class ChangeEventLocationToText extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('events');
        $table
            ->changeColumn('location', 'text', ['null' => true])
            ->save();
    }

    public function down(): void
    {
        $table = $this->table('events');
        $table
            ->changeColumn('location', 'string', ['null' => true, 'length' => 64])
            ->save();
    }
}
