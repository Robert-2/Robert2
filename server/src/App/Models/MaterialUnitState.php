<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Services\I18n;

class MaterialUnitState extends BaseModel
{
    public $incrementing = false;
    public $timestamps = false;

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function MaterialUnits()
    {
        return $this->hasMany('Robert2\API\Models\MaterialUnit', 'state');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = ['name'];

    protected $casts = [
        'id' => 'string',
        'order' => 'integer',
    ];

    protected function getNameAttribute()
    {
        return (new I18n)->translate(sprintf('unit-state.%s', $this->id));
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [];
}
