<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Validation\Validator as V;
use Robert2\API\Models\BaseModel;

class MaterialUnit extends BaseModel
{
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'park_id'       => V::notEmpty()->numeric(),
            'serial_number' => V::notEmpty()->alnum('-/*.')->length(2, 64),
            'is_broken'     => V::optional(V::boolType()),
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function Material()
    {
        return $this->belongsTo('Robert2\API\Models\Material');
    }

    public function Park()
    {
        return $this->belongsTo('Robert2\API\Models\Park');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'park_id'       => 'integer',
        'serial_number' => 'string',
        'is_broken'     => 'boolean',
    ];

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'park_id',
        'serial_number',
        'is_broken',
    ];
}
