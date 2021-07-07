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
        'event_id' => 'integer',
        'material_id' => 'integer',
        'quantity' => 'integer',
        'quantity_returned' => 'integer',
        'quantity_broken' => 'integer',
    ];

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function Units()
    {
        $relation = $this->belongsToMany(
            'Robert2\API\Models\MaterialUnit',
            'event_material_units',
            'event_material_id'
        );

        return $relation
            ->using('Robert2\API\Models\EventMaterialUnit')
            ->select(['material_units.id', 'is_returned', 'is_returned_broken']);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = ['units', 'units_with_return'];

    public function getUnitsAttribute()
    {
        $units = $this->Units()->get(['id']);
        if (!$units) {
            return [];
        }
        return array_column($units->toArray(), 'id');
    }

    public function getUnitsWithReturnAttribute()
    {
        $units = $this->Units()->get();
        if (!$units) {
            return [];
        }
        return array_map(function ($unit) {
            return [
                'id' => $unit['id'],
                'is_returned' => (bool)$unit['is_returned'],
                'is_returned_broken' => (bool)$unit['is_returned_broken'],
            ];
        }, $units->toArray());
    }
}
