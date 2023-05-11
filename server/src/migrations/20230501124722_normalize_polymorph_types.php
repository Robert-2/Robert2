<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;
use Robert2\API\Config\Config;
use Robert2\API\Models\Material;

final class NormalizePolymorphTypes extends AbstractMigration
{
    public function up(): void
    {
        $prefix = Config::getSettings('db')['prefix'];
        $this->getQueryBuilder()
            ->update(sprintf('%staggables', $prefix))
            ->set(['taggable_type' => 'material'])
            ->where(['taggable_type' => Material::class])
            ->execute();
    }

    public function down(): void
    {
        $prefix = Config::getSettings('db')['prefix'];
        $this->getQueryBuilder()
            ->update(sprintf('%staggables', $prefix))
            ->set(['taggable_type' => Material::class])
            ->where(['taggable_type' => 'material'])
            ->execute();
    }
}
