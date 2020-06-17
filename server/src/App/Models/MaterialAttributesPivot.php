<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class MaterialAttributesPivot extends Pivot
{
    protected $table = 'material_attributes';

    protected $casts = [
        'material_id'  => 'integer',
        'attribute_id' => 'integer',
        'value'        => 'string',
    ];
}
