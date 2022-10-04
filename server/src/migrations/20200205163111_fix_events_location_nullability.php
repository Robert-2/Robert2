<?php
use Phinx\Migration\AbstractMigration;
use Robert2\API\Config\Config;

class FixEventsLocationNullability extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('events');
        $table
            ->changeColumn('location', 'string', ['null' => true, 'length' => 64])
            ->update();

        $prefix = Config::getSettings('db')['prefix'];
        $this->execute(sprintf(
            "UPDATE `%sevents` SET `location` = NULL WHERE `location` = ''",
            $prefix
        ));
    }

    public function down()
    {
        $prefix = Config::getSettings('db')['prefix'];
        $this->execute(sprintf(
            "UPDATE `%sevents` SET `location` = '' WHERE `location` IS NULL",
            $prefix
        ));

        $table = $this->table('events');
        $table
            ->changeColumn('location', 'string', ['length' => 64])
            ->update();
    }
}
