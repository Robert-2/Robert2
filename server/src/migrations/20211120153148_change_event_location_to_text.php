<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class ChangeEventLocationToText extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('events');
        $table
            ->changeColumn('location', 'text', ['null' => true])
            ->save();
    }

    public function down()
    {
        $table = $this->table('events');
        $table
            ->changeColumn('location', 'string', ['null' => true, 'length' => 64])
            ->save();
    }
}
