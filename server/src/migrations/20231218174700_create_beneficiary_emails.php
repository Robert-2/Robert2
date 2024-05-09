<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateBeneficiaryEmails extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('beneficiary_emails', ['signed' => true]);
        $table
            ->addColumn('date', 'datetime', [
                'null' => false,
                'update' => '',
                'default' => 'CURRENT_TIMESTAMP',
            ])
            ->addColumn('beneficiary_id', 'integer', [
                'signed' => true,
                'null' => false,
            ])
            ->addColumn('type', 'enum', [
                'values' => ['reminder', 'reservation-approved', 'reservation-rejected'],
                'null' => false,
            ])
            ->addColumn('recipient', 'string', [
                'null' => false,
                'length' => 191,
            ])
            ->addColumn('subject', 'string', [
                'null' => false,
                'length' => 191,
            ])
            ->addColumn('body', 'text', [
                'null' => false,
            ])
            ->addIndex(['beneficiary_id'])
            ->addForeignKey('beneficiary_id', 'beneficiaries', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__beneficiary_email__beneficiary',
            ])
            ->create();
    }

    public function down(): void
    {
        $this->table('beneficiary_emails')->drop()->save();
    }
}
