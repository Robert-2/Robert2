<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;
use Loxya\Config\Config;

final class ResetEventsIsBillableWhenNoBilling extends AbstractMigration
{
    public function up(): void
    {
        $billingMode = Config::get('billingMode');
        if ($billingMode !== 'none') {
            return;
        }

        $prefix = Config::get('db.prefix');

        $this->getQueryBuilder()
            ->update(sprintf('%sevents', $prefix))
            ->set(['is_billable' => '0'])
            ->where(['is_billable' => '1'])
            ->execute();
    }

    public function down(): void
    {
        //
    }
}
