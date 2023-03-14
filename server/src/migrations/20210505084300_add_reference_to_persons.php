<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddReferenceToPersons extends AbstractMigration
{
    public function up()
    {
        $persons = $this->table('persons');
        $persons
            ->addColumn('reference', 'string', [
                'length' => 96,
                'after' => 'last_name',
                'null' => true,
            ])
            ->addIndex(['reference'], [
                'unique' => true,
                'name' => 'reference_UNIQUE',
            ])
            ->update();
    }

    public function down()
    {
        $persons = $this->table('persons');
        $persons
            ->removeColumn('reference')
            ->update();
    }
}
