<?php
declare(strict_types=1);

use Cake\Database\Query;
use Cake\Database\Query\DeleteQuery;
use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class AddReturnInventorySettings extends AbstractMigration
{
    public function up(): void
    {
        $data = [
            'key' => 'returnInventory.mode',
            'value' => 'start-empty',
        ];
        $this->table('settings')->insert($data)->save();
    }

    public function down(): void
    {
        $prefix = Config::get('db.prefix');

        /** @var DeleteQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_DELETE);
        $qb
            ->delete(sprintf('%ssettings', $prefix))
            ->where(['key' => 'returnInventory.mode'])
            ->execute();
    }
}
