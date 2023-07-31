<?php
declare(strict_types=1);

use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class AddNewSettings extends AbstractMigration
{
    public function up()
    {
        $data = [
            [
                'key' => 'calendar.event.showLocation',
                'value' => '1',
            ],
            [
                'key' => 'calendar.event.showBorrower',
                'value' => '0',
            ],
        ];
        $this->table('settings')->insert($data)->save();
    }

    public function down()
    {
        $prefix = Config::getSettings('db')['prefix'];
        $builder = $this->getQueryBuilder();
        $builder
            ->delete(sprintf('%ssettings', $prefix))
            ->where(function ($exp) {
                return $exp->in('key', [
                    'calendar.event.showBorrower',
                    'calendar.event.showLocation',
                ]);
            })
            ->execute();
    }
}
