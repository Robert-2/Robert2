<?php
use Phinx\Migration\AbstractMigration;

class ChangeEventDescriptionToText extends AbstractMigration
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
