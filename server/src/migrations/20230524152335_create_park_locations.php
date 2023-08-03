<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateParkLocations extends AbstractMigration
{
    public function up(): void
    {
        $parkLocations = $this->table('park_locations');
        $parkLocations
            ->addColumn('park_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('slot1', 'string', [
                'length' => 24,
                'null' => true,
            ])
            ->addColumn('slot2', 'string', [
                'length' => 24,
                'null' => true,
            ])
            ->addColumn('slot3', 'string', [
                'length' => 24,
                'null' => true,
            ])
            ->addIndex(['park_id'])
            ->addIndex(['park_id', 'slot1', 'slot2', 'slot3'], [
                'unique' => true,
            ])
            ->addForeignKey('park_id', 'parks', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__park_locations__park',
            ])
            ->create();

        $materials = $this->table('materials');
        $materials
            ->addColumn('park_location_id', 'integer', [
                'signed' => false,
                'null' => true,
                'after' => 'park_id',
            ])
            ->addIndex(['park_location_id'])
            ->addForeignKey('park_location_id', 'park_locations', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__materials__park_location',
            ])
            ->update();

        $materialUnits = $this->table('material_units');
        $materialUnits
            ->addColumn('park_location_id', 'integer', [
                'signed' => false,
                'null' => true,
                'after' => 'park_id',
            ])
            ->addIndex(['park_location_id'])
            ->addForeignKey('park_location_id', 'park_locations', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__material_units__park_location',
            ])
            ->update();
    }

    public function down(): void
    {
        $materials = $this->table('materials');
        $materials
            ->dropForeignKey('park_location_id')
            ->save();
        $materials
            ->removeColumn('park_location_id')
            ->update();

        $materialUnits = $this->table('material_units');
        $materialUnits
            ->dropForeignKey('park_location_id')
            ->save();
        $materialUnits
            ->removeColumn('park_location_id')
            ->update();

        $this->table('park_locations')->drop()->save();
    }
}
