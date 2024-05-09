<?php
declare(strict_types=1);

use Cake\Database\Query;
use Cake\Database\Query\UpdateQuery;
use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class AddIsTotalisableToAttributes extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('attributes');
        $table
            ->addColumn('is_totalisable', 'boolean', [
                'null' => true,
                'default' => null,
                'after' => 'max_length',
            ])
            ->update();

        $prefix = Config::get('db.prefix');

        /** @var UpdateQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_UPDATE);
        $qb
            ->update(sprintf('%sattributes', $prefix))
            ->set(['is_totalisable' => '0'])
            ->where(['type IN' => ['integer', 'float']])
            ->execute();
    }

    public function down(): void
    {
        $table = $this->table('attributes');
        $table
            ->removeColumn('is_totalisable')
            ->update();
    }
}
