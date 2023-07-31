<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;
use Loxya\Config\Config;

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

        $prefix = Config::getSettings('db')['prefix'];

        $this->getQueryBuilder()
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
