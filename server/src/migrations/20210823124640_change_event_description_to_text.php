<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class ChangeEventDescriptionToText extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('events');
        $table
            ->changeColumn('description', 'text', ['null' => true])
            ->save();
    }

    public function down()
    {
        $table = $this->table('events');
        $table
            ->changeColumn('description', 'string', ['null' => true, 'length' => 255])
            ->save();
    }
}
