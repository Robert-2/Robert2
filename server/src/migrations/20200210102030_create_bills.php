<?php
use Phinx\Migration\AbstractMigration;

class CreateBills extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('bills');
        $table
            ->addColumn('number', 'string', ['length' => 20])
            ->addColumn('date', 'datetime')
            ->addColumn('event_id', 'integer')
            ->addColumn('beneficiary_id', 'integer')
            ->addColumn('materials', 'json')
            ->addColumn('degressive_rate', 'decimal', ['precision' => 4, 'scale' => 2])
            ->addColumn('discount_rate', 'decimal', ['null' => true, 'precision' => 6, 'scale' => 4])
            ->addColumn('vat_rate', 'decimal', ['null' => true, 'precision' => 4, 'scale' => 2])
            ->addColumn('due_amount', 'decimal', ['precision' => 8, 'scale' => 2])
            ->addColumn('replacement_amount', 'decimal', ['precision' => 8, 'scale' => 2])
            ->addColumn('currency', 'string', ['length' => 3])
            ->addColumn('user_id', 'integer', ['null' => true])
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
                'constraint' => 'fk_bill_event'
            ])
            ->addForeignKey('beneficiary_id', 'persons', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_bill_beneficiary'
            ])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete' => 'NO_ACTION',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_bill_user'
            ])
            ->create();
    }

    public function down()
    {
        $this->table('bills')->drop()->save();
    }
}
