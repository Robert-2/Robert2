<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;
use Robert2\API\Config\Config;
use Illuminate\Support\Str;

final class AddPublicCalendarSettings extends AbstractMigration
{
    public function up()
    {
        $data = [
            [
                'key' => 'calendar.public.enabled',
                'value' => '0',
            ],
            [
                'key' => 'calendar.public.uuid',
                'value' => Str::uuid(),
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
                    'calendar.public.enabled',
                    'calendar.public.uuid',
                ]);
            })
            ->execute();
    }
}
