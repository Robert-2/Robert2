<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class EventMaterialUnit extends Pivot
{
    public $incrementing = true;

    protected $table = 'event_material_units';

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'event_material_id' => 'integer',
        'material_unit_id' => 'integer',
        'is_returned' => 'boolean',
        'is_returned_broken' => 'boolean',
    ];
}
