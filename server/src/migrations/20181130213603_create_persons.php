<?php
use Phinx\Migration\AbstractMigration;

class CreatePersons extends AbstractMigration
{
    public function up()
    {
        $persons = $this->table('persons');
        $persons
            ->addColumn('user_id', 'integer', ['null' => true])
            ->addColumn('first_name', 'string', ['length' => 96])
            ->addColumn('last_name', 'string', ['length' => 96])
            ->addColumn('nickname', 'string', ['length' => 96, 'null' => true])
            ->addColumn('email', 'string', ['length' => 191, 'null' => true])
            ->addColumn('phone', 'string', ['length' => 24, 'null' => true])
            ->addColumn('street', 'string', ['length' => 191, 'null' => true])
            ->addColumn('postal_code', 'string', ['length' => 10, 'null' => true])
            ->addColumn('locality', 'string', ['length' => 191, 'null' => true])
            ->addColumn('country_id', 'integer', ['null' => true])
            ->addColumn('company_id', 'integer', ['null' => true])
            ->addColumn('note', 'text', ['null' => true])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['user_id'])
            ->addIndex(['country_id'])
            ->addIndex(['company_id'])
            ->addIndex(['first_name', 'last_name', 'email'], [
                'unique' => true,
                'name'   => 'email_name_UNIQUE'
            ])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete'     => 'SET_NULL',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_persons_users'
            ])
            ->addForeignKey('country_id', 'countries', 'id', [
                'delete'     => 'SET_NULL',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_persons_countries'
            ])
            ->addForeignKey('company_id', 'companies', 'id', [
                'delete'     => 'SET_NULL',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_persons_companies'
            ])
            ->create();

        $personsTags = $this->table('persons_tags', [
            'id'          => false,
            'primary_key' => ['person_id', 'tag_id']
        ]);
        $personsTags
            ->addColumn('person_id', 'integer')
            ->addColumn('tag_id', 'integer')
            ->addForeignKey('person_id', 'persons', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_personstags_persons'
            ])
            ->addForeignKey('tag_id', 'tags', 'id', [
                'delete'     => 'CASCADE',
                'update'     => 'NO_ACTION',
                'constraint' => 'fk_personstags_tags'
            ])
            ->create();
    }

    public function down()
    {
        $this->table('persons_tags')->drop()->save();
        $this->table('persons')->drop()->save();
    }
}
