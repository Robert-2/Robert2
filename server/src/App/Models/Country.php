<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Loxya\Contracts\Serializable;
use Loxya\Models\Traits\Serializer;
use Respect\Validation\Validator as V;

/**
 * Pays.
 *
 * @property-read ?int $id
 * @property string $name
 * @property string $code
 * @property-read Carbon $created_at
 * @property-read Carbon|null $updated_at
 */
final class Country extends BaseModel implements Serializable
{
    use Serializer;

    protected $searchField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::custom([$this, 'checkName']),
            'code' => V::custom([$this, 'checkCode']),
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
            ->alpha(static::EXTRA_CHARS)
            ->length(4, 96)
            ->check($value);

        $query = static::where('name', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        return !$query->withTrashed()->exists()
            ?: 'country-name-already-in-use';
    }

    public function checkCode($value)
    {
        V::notEmpty()
            ->alpha()
            ->length(4, 4)
            ->check($value);

        $query = static::where('code', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        return $query->withTrashed()->exists()
            ? 'country-code-already-in-use'
            : true;
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'name' => 'string',
        'code' => 'string',
    ];

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = ['name', 'code'];

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(): array
    {
        return (new DotArray($this->attributesForSerialization()))
            ->delete(['created_at', 'updated_at'])
            ->all();
    }
}
