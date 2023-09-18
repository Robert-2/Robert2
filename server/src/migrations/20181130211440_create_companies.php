<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateCompanies extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('companies', ['signed' => true]);
        $table
            ->addColumn('legal_name', 'string', ['length' => 191, 'null' => false])
            ->addColumn('street', 'string', ['length' => 191, 'null' => true])
            ->addColumn('postal_code', 'string', ['length' => 10, 'null' => true])
            ->addColumn('locality', 'string', ['length' => 191, 'null' => true])
            ->addColumn('country_id', 'integer', ['signed' => true, 'null' => true])
            ->addColumn('phone', 'string', ['length' => 24, 'null' => true])
            ->addColumn('note', 'text', ['null' => true])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['country_id'])
            ->addIndex(['legal_name'], [
                'unique' => true,
                'name' => 'legal_name_UNIQUE',
            ])
            ->addForeignKey('country_id', 'countries', 'id', [
                'delete' => 'NO_ACTION',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_companies_countries',
            ])
            ->create();
    }

    public function down(): void
    {
        $this->table('companies')->drop()->save();
    }
}
