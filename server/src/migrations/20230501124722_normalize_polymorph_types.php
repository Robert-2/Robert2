<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;
use Loxya\Config\Config;

final class NormalizePolymorphTypes extends AbstractMigration
{
    public function up(): void
    {
        $prefix = Config::get('db.prefix');
        $this->getQueryBuilder()
            ->update(sprintf('%staggables', $prefix))
            ->set(['taggable_type' => 'material'])
            ->where(['taggable_type' => 'Robert2\\API\\Models\\Material'])
            ->execute();
    }

    public function down(): void
    {
        $prefix = Config::get('db.prefix');
        $this->getQueryBuilder()
            ->update(sprintf('%staggables', $prefix))
            ->set(['taggable_type' => 'Robert2\\API\\Models\\Material'])
            ->where(['taggable_type' => 'material'])
            ->execute();
    }
}
