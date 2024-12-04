<?php
declare(strict_types=1);

use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class AddTextTypeToAttributes extends AbstractMigration
{
    public function up(): void
    {
        $attributes = $this->table('attributes');
        $attributes
            ->changeColumn('type', 'enum', [
                'values' => ['string', 'text', 'integer', 'float', 'boolean', 'date'],
                'null' => false,
            ])
            ->save();
    }

    public function down(): void
    {
        $prefix = Config::get('db.prefix');

        $this->execute(sprintf(
            'UPDATE `%sattributes` SET `type` = "string" WHERE `type` = "text"',
            $prefix,
        ));

        $attributes = $this->table('attributes');
        $attributes
            ->changeColumn('type', 'enum', [
                'values' => ['string', 'integer', 'float', 'boolean', 'date'],
                'null' => false,
            ])
            ->save();
    }
}
