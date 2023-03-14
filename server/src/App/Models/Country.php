<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Traits\Serializer;
use Respect\Validation\Validator as V;
use Robert2\API\Models\Traits\SoftDeletable;

/**
 * Pays.
 *
 * @property-read ?int $id
 * @property string $name
 * @property string $code
 * @property-read Carbon $created_at
 * @property-read Carbon|null $updated_at
 * @property-read Carbon|null $deleted_at
 */
final class Country extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletable;

    protected $allowedSearchFields = ['name', 'code'];
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

        if ($query->withTrashed()->exists()) {
            return 'country-name-already-in-use';
        }

        return true;
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

        if ($query->withTrashed()->exists()) {
            return 'country-code-already-in-use';
        }

        return true;
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
        $data = $this->attributesForSerialization();

        unset(
            $data['created_at'],
            $data['updated_at'],
            $data['deleted_at'],
        );

        return $data;
    }
}
