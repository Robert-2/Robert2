<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;
use Robert2\API\Config\Config;

final class AddReturnInventorySettings extends AbstractMigration
{
    public function up()
    {
        $data = [
            'key' => 'returnInventory.mode',
            'value' => 'start-empty',
        ];
        $this->table('settings')->insert($data)->save();
    }

    public function down()
    {
        $prefix = Config::getSettings('db')['prefix'];
        $builder = $this->getQueryBuilder();
        $builder
            ->delete(sprintf('%ssettings', $prefix))
            ->where(['key' => 'returnInventory.mode'])
            ->execute();
    }
}
