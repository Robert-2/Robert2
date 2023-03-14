<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Brick\Math\BigDecimal as Decimal;
use Respect\Validation\Validator as V;
use Robert2\API\Models\Casts\AsDecimal;

/**
 * Matériel dans une facture.
 *
 * @property ?int $id
 * @property int $invoice_id
 * @property-read Invoice $invoice
 * @property int|null $material_id
 * @property-read Material|null $material
 * @property-read string $name
 * @property-read string $reference
 * @property int $quantity
 * @property Decimal $unit_price
 * @property Decimal $total_price
 * @property Decimal|null $replacement_price
 * @property bool $is_hidden_on_bill
 * @property bool $is_discountable
 */
final class InvoiceMaterial extends BaseModel
{
    protected $table = 'invoice_materials';
    public $timestamps = false;

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'invoice_id' => V::custom([$this, 'checkInvoice']),
            'material_id' => V::custom([$this, 'checkMaterial']),
            'name' => V::notEmpty()->length(2, 191),
            'reference' => V::notEmpty()->length(2, 64),
            'quantity' => V::intVal()->min(1),
            'unit_price' => V::custom([$this, 'checkAmount']),
            'total_price' => V::custom([$this, 'checkAmount']),
            'replacement_price' => V::optional(V::custom([$this, 'checkAmount'])),
            'is_hidden_on_bill' => V::optional(V::boolType()),
            'is_discountable' => V::optional(V::boolType()),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkInvoice($value)
    {
        // - L'identifiant de la facture n'est pas encore défini, on skip.
        if (!$this->exists && $value === null) {
            return true;
        }
        return Invoice::staticExists($value);
    }

    public function checkMaterial($value)
    {
        V::optional(V::numericVal())->check($value);

        return $value !== null
            ? Material::staticExists($value)
            : true;
    }

    public function checkAmount($value)
    {
        V::floatVal()->check($value);
        $value = Decimal::of($value);

        return (
            $value->isGreaterThanOrEqualTo(0) &&
            $value->isLessThan(1_000_000_000_000) &&
            $value->getScale() <= 2
        );
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class)
            ->withTrashed();
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    public $appends = [];

    protected $casts = [
        'invoice_id' => 'integer',
        'material_id' => 'integer',
        'name' => 'string',
        'reference' => 'string',
        'quantity' => 'integer',
        'unit_price' => AsDecimal::class,
        'total_price' => AsDecimal::class,
        'replacement_price' => AsDecimal::class,
        'is_hidden_on_bill' => 'boolean',
        'is_discountable' => 'boolean',
    ];

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'material_id',
        'name',
        'reference',
        'quantity',
        'unit_price',
        'total_price',
        'replacement_price',
        'is_hidden_on_bill',
        'is_discountable',
    ];
}
