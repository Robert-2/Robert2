<?php
declare(strict_types=1);

use Cake\Database\Query;
use Cake\Database\Query\DeleteQuery;
use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class RemoveInvalidDatesFromMaterialAttributes extends AbstractMigration
{
    public function up(): void
    {
        $prefix = Config::get('db.prefix');

        /** @var DeleteQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_DELETE);
        $qb
            ->delete(sprintf('%smaterial_attributes', $prefix))
            ->where(['value' => 'Invalid date'])
            ->execute();
    }

    public function down(): void
    {
        // - Pas de rollback pour ce fix.
    }
}
