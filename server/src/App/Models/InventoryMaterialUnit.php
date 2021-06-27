<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Validation\Validator as V;

class InventoryMaterialUnit extends BaseModel
{
    public $timestamps = false;

    protected $attributes = [
        'is_new' => false,
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'material_unit_id' => V::optional(V::numeric()),
            'reference' => V::notEmpty()->alnum('-+/*.')->length(2, 64),
            'is_new' => V::optional(V::boolType()),
            'is_lost_previous' => V::callback([$this, 'checkPreviousBoolean']),
            'is_lost_current' => V::boolType(),
            'is_broken_previous' => V::callback([$this, 'checkPreviousBoolean']),
            'is_broken_current' => V::boolType(),
        ];
    }

    public function checkPreviousBoolean($value)
    {
        if ($this->is_new) {
            return V::nullType();
        }
        return V::optional(V::boolType());
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function Material()
    {
        return $this->belongsTo(InventoryMaterial::class, 'inventory_material_id');
    }

    public function Unit()
    {
        return $this->belongsTo(MaterialUnit::class, 'material_unit_id');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'inventory_material_id' => 'integer',
        'material_unit_id'  => 'integer',
        'reference' => 'string',
        'is_new' => 'boolean',
        'is_lost_previous' => 'boolean',
        'is_lost_current' => 'boolean',
        'is_broken_previous' => 'boolean',
        'is_broken_current' => 'boolean',
    ];

    public function getMaterialAttribute()
    {
        return $this->Material()->first();
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'material_unit_id',
        'reference',
        'is_new',
        'is_lost_previous',
        'is_lost_current',
        'is_broken_previous',
        'is_broken_current',
    ];

    public function setReferenceAttribute($value)
    {
        $value = is_string($value) ? trim($value) : $value;
        $this->attributes['reference'] = $value;
    }
}
