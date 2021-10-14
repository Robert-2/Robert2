<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ListTemplateMaterialUnit extends Pivot
{
    public $incrementing = true;

    protected $table = 'list_template_material_units';

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'list_template_material_id' => 'integer',
        'material_unit_id' => 'integer',
    ];
}
