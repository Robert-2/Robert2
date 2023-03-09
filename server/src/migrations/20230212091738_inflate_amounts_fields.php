<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class InflateAmountsFields extends AbstractMigration
{
    protected $tablesFieldsMap = [
        'materials' => [
            'rental_price' => ['null' => true],
            'replacement_price' => ['null' => true],
        ],
        'estimates' => [
            'due_amount' => ['null' => false],
            'replacement_amount' => ['null' => false],
        ],
        'bills' => [
            'due_amount' => ['null' => false],
            'replacement_amount' => ['null' => false],
        ],
        'reservation_materials' => [
            'unit_price' => ['null' => true],
            'total_price' => ['null' => true],
        ],
        'reservations' => [
            'daily_total_without_taxes' => ['null' => true],
            'daily_total_taxes' => ['null' => true],
            'daily_total_with_taxes' => ['null' => true],
            'total_without_taxes' => ['null' => true],
            'total_taxes' => ['null' => true],
            'total_with_taxes' => ['null' => true],
        ],
    ];

    public function up(): void
    {
        $options = [
            'precision' => 14,
            'scale' => 2,
        ];

        foreach ($this->tablesFieldsMap as $table => $fields) {
            $table = $this->table($table);
            foreach ($fields as $field => $fieldOptions) {
                $table->changeColumn($field, 'decimal', array_merge($options, $fieldOptions));
            }
            $table->update();
        }
    }

    public function down(): void
    {
        $options = [
            'precision' => 8,
            'scale' => 2,
        ];

        foreach ($this->tablesFieldsMap as $table => $fields) {
            $table = $this->table($table);
            foreach ($fields as $field => $fieldOptions) {
                $table->changeColumn($field, 'decimal', array_merge($options, $fieldOptions));
            }
            $table->update();
        }
    }
}
