<?php
declare(strict_types=1);

use Cake\Database\Query;
use Cake\Database\Query\DeleteQuery;
use Loxya\Config\Config;
use Loxya\Support\Str;
use Phinx\Migration\AbstractMigration;

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

        /** @var DeleteQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_DELETE);
        $qb
            ->delete(sprintf('%ssettings', $prefix))
            ->where(static fn ($exp) => (
                $exp->in('key', [
                    'calendar.public.enabled',
                    'calendar.public.uuid',
                ])
            ))
            ->execute();
    }
}
