<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class RemoveUnicityConstraintOnPersons extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('persons');
        $table
            ->removeIndex(['first_name', 'last_name', 'email'])
            ->update();
    }

    public function down(): void
    {
        $table = $this->table('persons');
        $table
            ->addIndex(['first_name', 'last_name', 'email'], [
                'unique' => true,
                'name' => 'email_name_UNIQUE',
            ])
            ->update();
    }
}
