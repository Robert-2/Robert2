<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddSamlFieldsToUsers extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('users');
        $table
            ->addColumn('saml2_identifier', 'string', [
                'after' => 'cas_identifier',
                'null' => true,
            ])
            ->addIndex('saml2_identifier', ['unique' => true])
            ->save();
    }

    public function down(): void
    {
        $table = $this->table('users');
        $table
            ->removeColumn('saml2_identifier')
            ->save();
    }
}
