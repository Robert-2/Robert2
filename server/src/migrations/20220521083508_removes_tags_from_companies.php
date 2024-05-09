<?php
declare(strict_types=1);

use Cake\Database\Query;
use Cake\Database\Query\DeleteQuery;
use Cake\Database\Query\InsertQuery;
use Cake\Database\Query\SelectQuery;
use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class RemovesTagsFromCompanies extends AbstractMigration
{
    public function up(): void
    {
        $prefix = Config::get('db.prefix');

        /** @var DeleteQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_DELETE);
        $qb
            ->delete(sprintf('%staggables', $prefix))
            ->where(['taggable_type' => 'Loxya\Models\Company'])
            ->execute();
    }

    public function down(): void
    {
        $prefix = Config::get('db.prefix');
        $defaultTags = Config::get('defaultTags', []);

        // - Récupère toutes les sociétés déjà en base.
        /** @var SelectQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_SELECT);
        $companies = $qb
            ->select(['id'])
            ->from(sprintf('%scompanies', $prefix))
            ->execute()->fetchAll('assoc');

        if (empty($companies)) {
            return;
        }

        // - Id du tag "Bénéficiaire".
        /** @var SelectQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_SELECT);
        $beneficiaryTag = $qb
            ->select(['id'])
            ->from(sprintf('%stags', $prefix))
            ->where(['name' => $defaultTags['beneficiary'] ?? 'Bénéficiaire'])
            ->execute()->fetch('assoc');

        if (!$beneficiaryTag) {
            return;
        }

        /** @var InsertQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_INSERT);
        $qb
            ->insert(['tag_id', 'taggable_type', 'taggable_id'])
            ->into(sprintf('%staggables', $prefix));

        foreach ($companies as $company) {
            $qb->values([
                'tag_id' => $beneficiaryTag['id'],
                'taggable_type' => 'Loxya\Models\Company',
                'taggable_id' => $company['id'],
            ]);
        }

        $qb->execute();
    }
}
