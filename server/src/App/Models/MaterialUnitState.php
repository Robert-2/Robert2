<?php
declare(strict_types=1);

namespace Robert2\API\Models;

class MaterialUnitState extends BaseModel
{
    protected $primaryKey = 'name';

    public $incrementing = false;
    public $timestamps = false;

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function MaterialUnits()
    {
        return $this->hasMany('Robert2\API\Models\MaterialUnit', 'state', 'name');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'name' => 'string',
        'order' => 'integer',
    ];

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [];
}
