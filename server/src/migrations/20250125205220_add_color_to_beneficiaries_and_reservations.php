<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddColorToBeneficiariesAndReservations extends AbstractMigration
{
    public function up(): void
    {
        $reservations = $this->table('reservations');
        $reservations
            ->addColumn('color', 'char', [
                'length' => 7,
                'null' => true,
                'after' => 'preparer_id',
            ])
            ->update();

        $beneficiaries = $this->table('beneficiaries');
        $beneficiaries
            ->addColumn('color', 'char', [
                'length' => 7,
                'null' => true,
                'after' => 'company_id',
            ])
            ->update();
    }

    public function down(): void
    {
        $reservations = $this->table('reservations');
        $reservations
            ->removeColumn('color')
            ->update();

        $beneficiaries = $this->table('beneficiaries');
        $beneficiaries
            ->removeColumn('color')
            ->update();
    }
}
