<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;
use Loxya\Config\Config;

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
        $builder = $this->getQueryBuilder();
        $builder
            ->delete(sprintf('%ssettings', $prefix))
            ->where(['key' => 'returnInventory.mode'])
            ->execute();
    }
}
