<?php
declare(strict_types=1);

namespace Loxya\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Bénéficiaire dans un événement.
 *
 * @property-read ?int $id
 * @property int $event_id
 * @property-read Event $event
 * @property int $beneficiary_id
 * @property-read Beneficiary $beneficiary
 */
final class EventBeneficiary extends BasePivot
{
    protected $table = 'event_beneficiaries';

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class);
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'event_id' => 'integer',
        'beneficiary_id' => 'integer',
    ];
}
