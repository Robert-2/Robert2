<?php
declare(strict_types=1);

namespace Robert2\API\Models;

/**
 * Catégorie pour laquelle une caractéristique de matériel est limitée.
 *
 * @property-read int $attribute_id
 * @property-read int $category_id
 */
final class AttributeCategory extends BasePivot
{
    protected $table = 'attribute_categories';

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'attribute_id' => 'integer',
        'category_id' => 'integer',
    ];
}
