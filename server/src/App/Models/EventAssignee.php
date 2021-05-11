<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class EventAssignee extends Pivot
{
    public $incrementing = true;

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'event_id' => 'integer',
        'person_id' => 'integer',
        'position' => 'string',
    ];
}
