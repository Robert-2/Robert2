<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class ChangeMaterialAttributesRelationship extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('material_attributes');
        $table->dropForeignKey('attribute_id')->save();

        $table
            ->addForeignKey('attribute_id', 'attributes', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_attributes_attribute',
            ])
            ->save();
    }

    public function down(): void
    {
        $table = $this->table('material_attributes');
        $table->dropForeignKey('attribute_id')->save();

        $table
            ->addForeignKey('attribute_id', 'attributes', 'id', [
                'delete' => 'NO_ACTION',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_material_attributes_attribute',
            ])
            ->save();
    }
}
