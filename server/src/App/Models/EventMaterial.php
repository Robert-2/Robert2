<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class EventMaterial extends Pivot
{
    public $incrementing = true;

    protected $table = 'event_materials';

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'event_id' => 'integer',
        'material_id' => 'integer',
        'quantity' => 'integer',
        'quantity_returned' => 'integer',
        'quantity_broken' => 'integer',
    ];

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}
