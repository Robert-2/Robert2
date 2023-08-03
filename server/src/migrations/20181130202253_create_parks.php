<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;
use Loxya\Config\Config;

final class CreateParks extends AbstractMigration
{
    public function up()
    {
        $parks = $this->table('parks', ['signed' => true]);
        $parks
            ->addColumn('name', 'string', ['length' => 96, 'null' => false])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['name'], [
                'unique' => true,
                'name' => 'name_UNIQUE',
            ])
            ->create();

        //
        // - Data
        //

        $defaultNameTranslations = [
            'en' => 'Internal',
            'fr' => 'Interne',
        ];

        $lang = Config::getSettings('defaultLang');
        $defaultName = $defaultNameTranslations['en'];
        if ($lang && array_key_exists($lang, $defaultNameTranslations)) {
            $defaultName = $defaultNameTranslations[$lang];
        }

        $now = date('Y-m-d H:i:s');
        $parks
            ->insert([
                'name' => $defaultName,
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->save();
    }

    public function down()
    {
        $this->table('parks')->drop()->save();
    }
}
