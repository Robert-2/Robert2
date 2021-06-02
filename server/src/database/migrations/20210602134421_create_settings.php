<?php
use Phinx\Migration\AbstractMigration;

class CreateSettings extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('settings');
        $table
            ->addColumn('event_summary_material_display_mode', 'enum', [
                'null' => false,
                'values' => ['sub-categories', 'parks', 'flat'],
                'default' => 'sub-categories',
            ])
            ->addColumn('event_summary_custom_text_title', 'string', [
                'null' => true,
                'length' => 191,
            ])
            ->addColumn('event_summary_custom_text', 'text', [
                'null' => true,
            ])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->create();

        $table->insert([
            'event_summary_material_display_mode' => 'sub-categories',
            'created_at' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]);
        $table->saveData();
    }

    public function down()
    {
        $this->table('settings')->drop()->save();
    }
}
