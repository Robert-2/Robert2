<?php
declare(strict_types=1);

namespace Robert2\API\Models;

/**
 * Valeur d'un attribut personnalisé pour un matériel.
 *
 * @property-read int $material_id
 * @property-read int $attribute_id
 * @property string|null $value
 */
final class MaterialAttribute extends BasePivot
{
    protected $table = 'material_attributes';

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'material_id' => 'integer',
        'attribute_id' => 'integer',
        'value' => 'string',
    ];
}
