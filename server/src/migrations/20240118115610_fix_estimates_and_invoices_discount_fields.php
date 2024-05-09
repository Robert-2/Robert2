<?php
declare(strict_types=1);

use Brick\Math\BigDecimal as Decimal;
use Brick\Math\RoundingMode;
use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class FixEstimatesAndInvoicesDiscountFields extends AbstractMigration
{
    public function up(): void
    {
        $prefix = Config::get('db.prefix');

        foreach (['estimates', 'invoices'] as $tableName) {
            $table = $this->table($tableName);
            $table
                ->addColumn('total_without_discount', 'decimal', [
                    'precision' => 14,
                    'scale' => 2,
                    'null' => true,
                    'after' => 'daily_total_with_taxes',
                ])
                ->addColumn('total_discountable', 'decimal', [
                    'precision' => 14,
                    'scale' => 2,
                    'null' => true,
                    'after' => 'total_without_discount',
                ])
                ->addColumn('total_discount', 'decimal', [
                    'precision' => 14,
                    'scale' => 2,
                    'null' => true,
                    'after' => 'total_discountable',
                ])
                ->save();

            // - Re-calcul des remises pour les devis existants.
            $allEntries = $this->fetchAll(sprintf("SELECT * FROM `%s%s`", $prefix, $tableName));
            foreach ($allEntries as $entry) {
                $degressiveRate = Decimal::of($entry['degressive_rate']);
                $totalWithoutDiscount = Decimal::of($entry['daily_total_without_discount'])
                    ->multipliedBy($degressiveRate)
                    ->toScale(2, RoundingMode::HALF_UP);
                $totalDiscountable = Decimal::of($entry['daily_total_discountable'])
                    ->multipliedBy($degressiveRate)
                    ->toScale(2, RoundingMode::HALF_UP);
                $totalDiscount = Decimal::of($entry['daily_total_discount'])
                    ->multipliedBy($degressiveRate)
                    ->toScale(2, RoundingMode::HALF_UP);

                $this->execute(
                    sprintf(
                        "UPDATE `%s%s` SET " .
                        "`total_without_discount` = ?, `total_discountable` = ?, `total_discount` = ? " .
                        "WHERE `id` = ?",
                        $prefix,
                        $tableName,
                    ),
                    [$totalWithoutDiscount, $totalDiscountable, $totalDiscount, $entry['id']],
                );
            }

            $table
                ->renameColumn('daily_total_without_discount', 'daily_total')
                ->removeColumn('daily_total_discountable')
                ->removeColumn('daily_total_discount')
                ->removeColumn('daily_total_without_taxes')
                ->removeColumn('daily_total_taxes')
                ->removeColumn('daily_total_with_taxes')
                ->save();
        }
    }

    public function down(): void
    {
        $prefix = Config::get('db.prefix');

        foreach (['invoices', 'estimates'] as $tableName) {
            $table = $this->table($tableName);
            $table
                ->addColumn('daily_total_without_discount', 'decimal', [
                    'precision' => 14,
                    'scale' => 2,
                    'null' => true,
                    'after' => 'vat_rate',
                ])
                ->addColumn('daily_total_discountable', 'decimal', [
                    'precision' => 14,
                    'scale' => 2,
                    'null' => true,
                    'after' => 'daily_total_without_discount',
                ])
                ->addColumn('daily_total_discount', 'decimal', [
                    'precision' => 14,
                    'scale' => 2,
                    'null' => true,
                    'after' => 'daily_total_discountable',
                ])
                ->addColumn('daily_total_without_taxes', 'decimal', [
                    'precision' => 14,
                    'scale' => 2,
                    'null' => true,
                    'after' => 'daily_total_discount',
                ])
                ->addColumn('daily_total_taxes', 'decimal', [
                    'precision' => 14,
                    'scale' => 2,
                    'null' => true,
                    'after' => 'daily_total_without_taxes',
                ])
                ->addColumn('daily_total_with_taxes', 'decimal', [
                    'precision' => 14,
                    'scale' => 2,
                    'null' => true,
                    'after' => 'daily_total_taxes',
                ])
                ->save();

            $allEntries = $this->fetchAll(sprintf("SELECT * FROM `%s%s`", $prefix, $tableName));
            foreach ($allEntries as $entry) {
                $degressiveRate = Decimal::of($entry['degressive_rate']);
                $vatRate = Decimal::of($entry['vat_rate']);
                $vatRate = $vatRate->isZero()
                    ? Decimal::of(1)
                    : $vatRate->dividedBy(100, 4, RoundingMode::UNNECESSARY);

                $dailyTotalWithoutDiscount = Decimal::of($entry['daily_total'])
                    ->toScale(2, RoundingMode::HALF_UP);
                $dailyTotalDiscountable = Decimal::of($entry['total_discountable'])
                    ->dividedBy($degressiveRate, 2, RoundingMode::HALF_UP)
                    ->toScale(2, RoundingMode::HALF_UP);
                $dailyTotalDiscount = Decimal::of($entry['total_discount'])
                    ->dividedBy($degressiveRate, 2, RoundingMode::HALF_UP)
                    ->toScale(2, RoundingMode::HALF_UP);
                $dailyTotalWithoutTaxes = $dailyTotalWithoutDiscount
                    ->minus($dailyTotalDiscount)
                    ->toScale(2, RoundingMode::HALF_UP);
                $dailyTotalTaxes = $dailyTotalWithoutTaxes
                    ->dividedBy($vatRate, 2, RoundingMode::HALF_UP)
                    ->toScale(2, RoundingMode::HALF_UP);
                $dailyTotalWithTaxes = $dailyTotalWithoutTaxes
                    ->plus($dailyTotalTaxes)
                    ->toScale(2, RoundingMode::HALF_UP);

                $this->execute(
                    sprintf(
                        "UPDATE `%s%s` SET " .
                        "`daily_total_without_discount` = ?, " .
                        "`daily_total_discountable` = ?, " .
                        "`daily_total_discount` = ?, " .
                        "`daily_total_without_taxes` = ?, " .
                        "`daily_total_taxes` = ?, " .
                        "`daily_total_with_taxes` = ? " .
                        "WHERE `id` = ?",
                        $prefix,
                        $tableName,
                    ),
                    [
                        $dailyTotalWithoutDiscount,
                        $dailyTotalDiscountable,
                        $dailyTotalDiscount,
                        $dailyTotalWithoutTaxes,
                        $dailyTotalTaxes,
                        $dailyTotalWithTaxes,
                        $entry['id'],
                    ],
                );
            }

            $table
                ->removeColumn('daily_total')
                ->removeColumn('total_without_discount')
                ->removeColumn('total_discountable')
                ->removeColumn('total_discount')
                ->save();
        }
    }
}
