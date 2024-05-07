<?php
declare(strict_types=1);

use Cake\Database\Query;
use Cake\Database\Query\UpdateQuery;
use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class NormalizePolymorphTypes extends AbstractMigration
{
    public function up(): void
    {
        $prefix = Config::get('db.prefix');

        /** @var UpdateQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_UPDATE);
        $qb
            ->update(sprintf('%staggables', $prefix))
            ->set(['taggable_type' => 'material'])
            ->where(['taggable_type' => 'Robert2\\API\\Models\\Material'])
            ->execute();
    }

    public function down(): void
    {
        $prefix = Config::get('db.prefix');

        /** @var UpdateQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_UPDATE);
        $qb
            ->update(sprintf('%staggables', $prefix))
            ->set(['taggable_type' => 'Robert2\\API\\Models\\Material'])
            ->where(['taggable_type' => 'material'])
            ->execute();
    }
}
