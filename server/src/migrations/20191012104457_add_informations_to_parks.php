<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddInformationsToParks extends AbstractMigration
{
    public function up()
    {
        $parks = $this->table('parks', ['signed' => true]);
        $parks
            ->addColumn('person_id', 'integer', [
                'signed' => true,
                'null' => true,
                'after' => 'name',
            ])
            ->addColumn('company_id', 'integer', [
                'signed' => true,
                'null' => true,
                'after' => 'person_id',
            ])
            ->addColumn('street', 'string', [
                'null' => true,
                'limit' => 191,
                'after' => 'company_id',
            ])
            ->addColumn('postal_code', 'string', [
                'null' => true,
                'limit' => 10,
                'after' => 'street',
            ])
            ->addColumn('locality', 'string', [
                'null' => true,
                'limit' => 191,
                'after' => 'postal_code',
            ])
            ->addColumn('country_id', 'integer', [
                'signed' => true,
                'null' => true,
                'after' => 'locality',
            ])
            ->addColumn('opening_hours', 'string', [
                'null' => true,
                'limit' => 255,
                'after' => 'country_id',
            ])
            ->addColumn('note', 'text', [
                'null' => true,
                'after' => 'opening_hours',
            ])
            ->addIndex(['person_id'])
            ->addForeignKey('person_id', 'persons', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_parks_persons',
            ])
            ->addIndex(['company_id'])
            ->addForeignKey('company_id', 'companies', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_parks_companies',
            ])
            ->addIndex(['country_id'])
            ->addForeignKey('country_id', 'countries', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_parks_countries',
            ])
            ->update();
    }

    public function down()
    {
        $parks = $this->table('parks');
        $parks
            ->dropForeignKey('person_id')
            ->dropForeignKey('company_id')
            ->dropForeignKey('country_id')
            ->update();

        $parks
            ->removeColumn('person_id')
            ->removeColumn('company_id')
            ->removeColumn('street')
            ->removeColumn('postal_code')
            ->removeColumn('locality')
            ->removeColumn('country_id')
            ->removeColumn('opening_hours')
            ->removeColumn('note')
            ->update();
    }
}
