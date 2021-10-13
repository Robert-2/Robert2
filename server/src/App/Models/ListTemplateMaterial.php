<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ListTemplateMaterial extends Pivot
{
    public $incrementing = true;

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'list_template_id' => 'integer',
        'material_id' => 'integer',
        'quantity' => 'integer',
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
            'list_template_material_units',
            'list_template_material_id'
        );

        return $relation
            ->using('Robert2\API\Models\ListTemplateMaterialUnit')
            ->select(['material_units.id']);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = ['units'];

    public function getUnitsAttribute()
    {
        $units = $this->Units()->get(['id']);
        if (!$units) {
            return [];
        }
        return array_column($units->toArray(), 'id');
    }
}
