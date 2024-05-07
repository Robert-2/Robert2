<?php
declare(strict_types=1);

use Cake\Database\Query;
use Cake\Database\Query\DeleteQuery;
use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class AddNewSettings extends AbstractMigration
{
    public function up(): void
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

    public function down(): void
    {
        $prefix = Config::get('db.prefix');

        /** @var DeleteQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_DELETE);
        $qb
            ->delete(sprintf('%ssettings', $prefix))
            ->where(static fn ($exp) => (
                $exp->in('key', [
                    'calendar.event.showBorrower',
                    'calendar.event.showLocation',
                ])
            ))
            ->execute();
    }
}
