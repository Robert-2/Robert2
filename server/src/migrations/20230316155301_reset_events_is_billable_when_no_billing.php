<?php
declare(strict_types=1);

use Cake\Database\Query;
use Cake\Database\Query\UpdateQuery;
use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class ResetEventsIsBillableWhenNoBilling extends AbstractMigration
{
    public function up(): void
    {
        $billingMode = Config::get('billingMode');
        if ($billingMode !== 'none') {
            return;
        }

        $prefix = Config::get('db.prefix');

        /** @var UpdateQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_UPDATE);
        $qb
            ->update(sprintf('%sevents', $prefix))
            ->set(['is_billable' => '0'])
            ->where(['is_billable' => '1'])
            ->execute();
    }

    public function down(): void
    {
        // - Pas de rollback pour ce fix.
    }
}
