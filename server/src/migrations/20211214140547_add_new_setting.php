<?php
declare(strict_types=1);

use Cake\Database\Query;
use Cake\Database\Query\DeleteQuery;
use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

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

        /** @var DeleteQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_DELETE);
        $qb
            ->delete(sprintf('%ssettings', $prefix))
            ->where(['key' => 'eventSummary.showLegalNumbers'])
            ->execute();
    }
}
