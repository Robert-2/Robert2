<?php
use Phinx\Migration\AbstractMigration;

class AddDateTypeToAttributes extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('attributes');
        $table->changeColumn('type', 'enum', [
            'values' => ['string', 'integer', 'float', 'boolean', 'date']
        ])->update();
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
        $table->changeColumn('type', 'enum', [
            'values' => ['string', 'integer', 'float', 'boolean']
        ])->update();
    }
}
