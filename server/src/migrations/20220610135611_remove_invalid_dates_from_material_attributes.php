<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;
use Robert2\API\Config\Config as Config;

final class RemoveInvalidDatesFromMaterialAttributes extends AbstractMigration
{
    public function up(): void
    {
        $prefix = Config::getSettings('db')['prefix'];
        $builder = $this->getQueryBuilder();
        $builder
            ->delete(sprintf('%smaterial_attributes', $prefix))
            ->where(['value' => 'Invalid date'])
            ->execute();
    }

    public function down(): void
    {
    }
}
