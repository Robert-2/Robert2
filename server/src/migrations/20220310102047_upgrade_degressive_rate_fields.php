<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class UpgradeDegressiveRateFields extends AbstractMigration
{
    public function up(): void
    {
        $bills = $this->table('bills');
        $bills
            ->changeColumn('degressive_rate', 'decimal', [
                'precision' => 7,
                'scale' => 2,
                'null' => false,
            ])
            ->save();

        $estimates = $this->table('estimates');
        $estimates
            ->changeColumn('degressive_rate', 'decimal', [
                'precision' => 7,
                'scale' => 2,
                'null' => false,
            ])
            ->save();
    }

    public function down(): void
    {
        $estimates = $this->table('estimates');
        $estimates
            ->changeColumn('degressive_rate', 'decimal', [
                'precision' => 4,
                'scale' => 2,
                'null' => false,
            ])
            ->save();

        $bills = $this->table('bills');
        $bills
            ->changeColumn('degressive_rate', 'decimal', [
                'precision' => 4,
                'scale' => 2,
                'null' => false,
            ])
            ->save();
    }
}
