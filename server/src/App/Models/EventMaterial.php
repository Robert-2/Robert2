<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class EventMaterial extends Pivot
{
    public $incrementing = true;

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'event_id'    => 'integer',
        'material_id' => 'integer',
        'quantity'    => 'integer',
    ];

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function Units()
    {
        $relation = $this->hasMany(
            'Robert2\API\Models\EventMaterialUnit',
            'event_material_id',
            'id'
        );
        return $relation->select(['id', 'material_unit_id']);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = ['units'];

    public function getUnitsAttribute()
    {
        $units = $this->Units()->get();
        if (!$units) {
            return [];
        }
        return array_column($units->toArray(), 'material_unit_id');
    }
}
