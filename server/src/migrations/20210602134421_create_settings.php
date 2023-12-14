<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateSettings extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('settings', ['id' => false, 'primary_key' => 'key']);
        $table
            ->addColumn('key', 'string', ['null' => false, 'length' => 64])
            ->addColumn('value', 'text', ['null' => true])
            ->create();

        $settingsData = [
            [
                'key' => 'event_summary_material_display_mode',
                'value' => 'sub-categories',
            ],
            [
                'key' => 'event_summary_custom_text_title',
                'value' => null,
            ],
            [
                'key' => 'event_summary_custom_text',
                'value' => null,
            ],
        ];
        $this->table('settings')->insert($settingsData)->save();
    }

    public function down(): void
    {
        $this->table('settings')->drop()->save();
    }
}
