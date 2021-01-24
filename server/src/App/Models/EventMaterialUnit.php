<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Models\BaseModel;

class EventMaterialUnit extends BaseModel
{
    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function EventMaterial()
    {
        return $this->belongsTo('Robert2\API\Models\EventMaterial');
    }

    public function MaterialUnit()
    {
        return $this->belongsTo('Robert2\API\Models\MaterialUnit');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'event_material_id' => 'integer',
        'material_unit_id'  => 'integer',
    ];

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'event_material_id',
        'material_unit_id',
    ];
}
