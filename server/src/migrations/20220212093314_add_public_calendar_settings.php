<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;
use Loxya\Config\Config;
use Loxya\Support\Str;

final class AddPublicCalendarSettings extends AbstractMigration
{
    public function up(): void
    {
        $data = [
            [
                'key' => 'calendar.public.enabled',
                'value' => '0',
            ],
            [
                'key' => 'calendar.public.uuid',
                'value' => (string) Str::uuid(),
            ],
        ];
        $this->table('settings')->insert($data)->save();
    }

    public function down(): void
    {
        $prefix = Config::get('db.prefix');
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
