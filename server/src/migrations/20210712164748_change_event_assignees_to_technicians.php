<?php
use Phinx\Migration\AbstractMigration;

use Robert2\API\Config as Config;

class ChangeEventAssigneesToTechnicians extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('event_assignees');
        $table->removeIndex('person_id')->dropForeignKey('person_id')->save();
        $table
            ->renameColumn('person_id', 'technician_id')
            ->addColumn('start_time', 'datetime', [
                'null' => true,
                'after' => 'technician_id',
            ])
            ->addColumn('end_time', 'datetime', [
                'null' => true,
                'after' => 'start_time',
            ])
            ->addIndex(['technician_id'])
            ->addForeignKey('technician_id', 'persons', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_event_technicians_technician'
            ])
            ->save();

        $prefix = Config\Config::getSettings('db')['prefix'];

        $allEvents = $this->fetchAll(
            sprintf("SELECT `id`, `start_date`, `end_date` FROM `%sevents`", $prefix)
        );
        foreach ($allEvents as $event) {
            $this->execute(sprintf(
                "UPDATE `%sevent_assignees` SET `start_time` = '%s', `end_time` = '%s' WHERE `event_id` = %d",
                $prefix,
                $event['start_date'],
                $event['end_date'],
                $event['id']
            ));
        }

        $table
            ->changeColumn('start_time', 'datetime', ['null' => false])
            ->changeColumn('end_time', 'datetime', ['null' => false])
            ->save();

        $table->rename(sprintf('%sevent_technicians', $prefix))->update();
    }

    public function down()
    {
        $table = $this->table('event_technicians');
        $table
            ->removeColumn('start_time', 'datetime')
            ->removeColumn('end_time', 'datetime')
            ->renameColumn('technician_id', 'person_id')
            ->save();

        $table->rename('event_assignees')->update();
    }
}
