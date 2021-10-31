<?php
use Phinx\Migration\AbstractMigration;

class ChangeMaterialAttributesRelationship extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('material_attributes');
        $table->dropForeignKey('attribute_id')->save();

        $table->addForeignKey('attribute_id', 'attributes', 'id', [
            'delete'     => 'CASCADE',
            'update'     => 'NO_ACTION',
            'constraint' => 'fk_material_attributes_attribute'
        ])->save();
    }

    public function down()
    {
        $table = $this->table('material_attributes');
        $table->dropForeignKey('attribute_id')->save();

        $table->addForeignKey('attribute_id', 'attributes', 'id', [
            'delete'     => 'NO_ACTION',
            'update'     => 'NO_ACTION',
            'constraint' => 'fk_material_attributes_attribute'
        ])->save();
    }
}
