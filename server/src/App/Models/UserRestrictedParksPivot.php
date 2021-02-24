<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class UserRestrictedParksPivot extends Pivot
{
    public $incrementing = true;

    protected $table = 'user_restricted_parks';

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'user_id' => 'integer',
        'park_id' => 'integer',
    ];
}
