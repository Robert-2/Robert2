<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Loxya\Contracts\Serializable;
use Loxya\Models\Traits\Serializer;
use Respect\Validation\Validator as V;
use Loxya\Models\Traits\SoftDeletable;

/**
 * Tag.
 *
 * @property-read ?int $id
 * @property string $name
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
 * @property-read CarbonImmutable|null $deleted_at
 *
 * @property-read Collection|Material[] $materials
 */
final class Tag extends BaseModel implements Serializable
{
    use SoftDeletable;
    use Serializer;

    protected $searchField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::custom([$this, 'checkName']),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkName($value)
    {
        V::notEmpty()
            ->length(1, 48)
            ->check($value);

        $query = static::where('name', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        return !$query->withTrashed()->exists()
            ?: 'tag-name-already-in-use';
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function materials()
    {
        return $this->morphedByMany(Material::class, 'taggable')
            ->orderBy('id');
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'name' => 'string',
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
        'deleted_at' => 'immutable_datetime',
    ];

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = ['name'];

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(): array
    {
        return (new DotArray($this->attributesForSerialization()))
            ->delete(['created_at', 'updated_at', 'deleted_at'])
            ->all();
    }
}
