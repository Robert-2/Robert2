<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Collection;
use Robert2\API\Validation\Validator as V;

class InventoryMaterial extends BaseModel
{
    public $timestamps = false;

    protected $attributes = [
        'is_new' => false,
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'material_id' => V::optional(V::numeric()),
            'name' => V::notEmpty()->length(2, 191),
            'reference' => V::notEmpty()->alnum('.,-+/_ ')->length(2, 64),
            'is_unitary' => V::boolType(),
            'is_new' => V::optional(V::boolType()),
            'stock_quantity_previous' => V::callback([$this, 'checkQuantityPrevious']),
            'stock_quantity_current' => V::callback([$this, 'checkQuantity']),
            'out_of_order_quantity_previous' => V::callback([$this, 'checkQuantityPrevious']),
            'out_of_order_quantity_current' => V::callback([$this, 'checkQuantity']),
        ];
    }

    public function checkQuantity($value, $optional = false)
    {
        if ($this->is_unitary) {
            return V::nullType();
        }

        $rule = V::intVal()->max(100000);
        return $optional ? V::optional($rule) : $rule;
    }

    public function checkQuantityPrevious($value)
    {
        if ($this->is_new) {
            return V::nullType();
        }
        return $this->checkQuantity($value, true);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function Inventory()
    {
        return $this->belongsTo(Inventory::class);
    }

    public function Material()
    {
        return $this->belongsTo(Material::class);
    }

    public function Units()
    {
        return $this->hasMany(InventoryMaterialUnit::class);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = ['units'];

    protected $casts = [
        'inventory_id' => 'integer',
        'material_id' => 'integer',
        'name' => 'string',
        'reference' => 'string',
        'is_unitary' => 'boolean',
        'is_new' => 'boolean',
        'stock_quantity_previous' => 'integer',
        'stock_quantity_current' => 'integer',
        'out_of_order_quantity_previous' => 'integer',
        'out_of_order_quantity_current' => 'integer',
    ];

    public function getStockQuantityPreviousAttribute($value)
    {
        if ($this->is_unitary) {
            $value = $this->Units()->where('is_lost_previous', '!=', true)->count();
        }
        return $this->castAttribute('stock_quantity_previous', $value);
    }

    public function getStockQuantityCurrentAttribute($value)
    {
        if ($this->is_unitary) {
            $value = $this->Units()->where('is_lost_current', '!=', true)->count();
        }
        return $this->castAttribute('out_of_order_quantity_previous', $value);
    }

    public function getOutOfOrderQuantityPreviousAttribute($value)
    {
        if ($this->is_unitary) {
            $value = $this->Units()->where('is_broken_previous', true)->count();
        }
        return $this->castAttribute('stock_quantity_current', $value);
    }

    public function getOutOfOrderQuantityCurrentAttribute($value)
    {
        if ($this->is_unitary) {
            $value = $this->Units()->where('is_broken_current', true)->count();
        }
        return $this->castAttribute('out_of_order_quantity_current', $value);
    }

    public function getUnitsAttribute(): Collection
    {
        if (!$this->is_unitary) {
            return new Collection([]);
        }
        return $this->Units()->get();
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'material_id',
        'name',
        'reference',
        'is_unitary',
        'is_new',
        'stock_quantity_previous',
        'stock_quantity_current',
        'out_of_order_quantity_previous',
        'out_of_order_quantity_current',
    ];

    public function setReferenceAttribute($value)
    {
        $value = is_string($value) ? trim($value) : $value;
        $this->attributes['reference'] = $value;
    }
}
