<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;
use Loxya\Config\Config;

final class AddNewSetting extends AbstractMigration
{
    public function up(): void
    {
        $data = [
            'key' => 'eventSummary.showLegalNumbers',
            'value' => '1',
        ];
        $this->table('settings')->insert($data)->saveData();
    }

    public function down(): void
    {
        $prefix = Config::get('db.prefix');
        $builder = $this->getQueryBuilder();
        $builder
            ->delete(sprintf('%ssettings', $prefix))
            ->where(['key' => 'eventSummary.showLegalNumbers'])
            ->execute();
    }
}
