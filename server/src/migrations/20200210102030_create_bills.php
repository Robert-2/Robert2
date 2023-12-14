<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateBills extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('bills', ['signed' => true]);
        $table
            ->addColumn('number', 'string', ['length' => 20, 'null' => false])
            ->addColumn('date', 'datetime', ['null' => false])
            ->addColumn('event_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('beneficiary_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('materials', 'json', ['null' => false])
            ->addColumn('degressive_rate', 'decimal', [
                'precision' => 4,
                'scale' => 2,
                'null' => false,
            ])
            ->addColumn('discount_rate', 'decimal', ['null' => true, 'precision' => 6, 'scale' => 4])
            ->addColumn('vat_rate', 'decimal', ['null' => true, 'precision' => 4, 'scale' => 2])
            ->addColumn('due_amount', 'decimal', [
                'precision' => 8,
                'scale' => 2,
                'null' => false,
            ])
            ->addColumn('replacement_amount', 'decimal', [
                'precision' => 8,
                'scale' => 2,
                'null' => false,
            ])
            ->addColumn('currency', 'string', ['length' => 3, 'null' => false])
            ->addColumn('user_id', 'integer', ['signed' => true, 'null' => true])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['number'], ['unique' => true])
            ->addIndex(['event_id'])
            ->addIndex(['beneficiary_id'])
            ->addIndex(['user_id'])
            ->addForeignKey('event_id', 'events', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'RESTRICT',
                'constraint' => 'fk_bill_event',
            ])
            ->addForeignKey('beneficiary_id', 'persons', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_bill_beneficiary',
            ])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete' => 'NO_ACTION',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_bill_user',
            ])
            ->create();
    }

    public function down(): void
    {
        $this->table('bills')->drop()->save();
    }
}
