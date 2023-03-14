<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddDateTypeToAttributes extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('attributes');
        $table
            ->changeColumn('type', 'enum', [
                'values' => ['string', 'integer', 'float', 'boolean', 'date'],
                'null' => false,
            ])
            ->update();
    }

    public function down()
    {
        // - Obligé de nettoyer "à la main" étant donné que `material_attributes` n'a pas de
        // contrainte "CASCADE" pour la suppression...
        $attributes = $this->fetchAll("SELECT `id` FROM `attributes` WHERE `type` = 'date'");
        foreach ($attributes as $attribute) {
            $this->execute(sprintf(
                "DELETE FROM `material_attributes` WHERE `attribute_id` = %d",
                $attribute['id']
            ));
        }

        $this->execute("DELETE FROM `attributes` WHERE `type` = 'date'");

        $table = $this->table('attributes');
        $table
            ->changeColumn('type', 'enum', [
                'values' => ['string', 'integer', 'float', 'boolean'],
                'null' => false,
            ])
            ->update();
    }
}
