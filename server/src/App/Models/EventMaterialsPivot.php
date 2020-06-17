<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class EventMaterialsPivot extends Pivot
{
    protected $casts = [
        'event_id'    => 'integer',
        'material_id' => 'integer',
        'quantity'    => 'integer',
    ];
}
