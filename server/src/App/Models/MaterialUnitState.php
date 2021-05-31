<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Validation\Validator as V;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaterialUnitState extends BaseModel
{
    use SoftDeletes;

    protected $orderField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::notEmpty()->alnum(static::EXTRA_CHARS)->length(2, 64),
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function MaterialUnits()
    {
        return $this->hasMany('Robert2\API\Models\MaterialUnit');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'name' => 'string',
    ];

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'name',
    ];
}
