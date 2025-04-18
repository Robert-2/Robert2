<?php
declare(strict_types=1);

namespace Loxya\Models;

/**
 * Un rôle d'un technicien.
 *
 * @property-read int $technician_id
 * @property-read int $role_id
 */
final class TechnicianRole extends BasePivot
{
    protected $table = 'technician_roles';

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'technician_id' => 'integer',
        'role_id' => 'integer',
    ];
}
