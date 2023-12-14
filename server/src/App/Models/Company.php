<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Loxya\Contracts\Serializable;
use Loxya\Models\Traits\Serializer;
use Respect\Validation\Validator as V;
use Loxya\Models\Traits\SoftDeletable;

/**
 * Société.
 *
 * @property-read ?int $id
 * @property string $legal_name
 * @property string|null $phone
 * @property string|null $street
 * @property string|null $postal_code
 * @property string|null $locality
 * @property int|null $country_id
 * @property-read Country|null $country
 * @property-read string|null $full_address
 * @property string|null $note
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
 * @property-read CarbonImmutable|null $deleted_at
 *
 * @property-read Collection|Beneficiary[] $beneficiaries
 */
final class Company extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletable;

    protected $orderField = 'legal_name';
    protected $searchField = 'legal_name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'legal_name' => V::custom([$this, 'checkLegalName']),
            'street' => V::optional(V::length(null, 191)),
            'postal_code' => V::optional(V::length(null, 10)),
            'locality' => V::optional(V::length(null, 191)),
            'country_id' => V::custom([$this, 'checkCountryId']),
            'phone' => V::optional(V::phone()),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkLegalName($value)
    {
        V::notEmpty()
            ->length(2, 191)
            ->check($value);

        $query = static::where('legal_name', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        return !$query->withTrashed()->exists()
            ?: 'company-legal-name-already-in-use';
    }

    public function checkCountryId($value)
    {
        V::optional(V::numericVal())->check($value);

        return $value !== null
            ? Country::staticExists($value)
            : true;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function beneficiaries()
    {
        return $this->hasMany(Beneficiary::class)
            ->orderBy('id');
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $appends = [
        'full_address',
        'country',
    ];

    protected $casts = [
        'legal_name' => 'string',
        'street' => 'string',
        'postal_code' => 'string',
        'locality' => 'string',
        'country_id' => 'integer',
        'phone' => 'string',
        'note' => 'string',
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
        'deleted_at' => 'immutable_datetime',
    ];

    public function getFullAddressAttribute()
    {
        $addressParts = [];

        $addressParts[] = trim($this->street ?? '');
        $addressParts[] = implode(' ', array_filter([
            trim($this->postal_code ?? ''),
            trim($this->locality ?? ''),
        ]));

        $addressParts = array_filter($addressParts);
        return !empty($addressParts) ? implode("\n", $addressParts) : null;
    }

    public function getCountryAttribute()
    {
        return $this->getRelationValue('country');
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'legal_name',
        'street',
        'postal_code',
        'locality',
        'country_id',
        'phone',
        'note',
    ];

    public function setPhoneAttribute($value): void
    {
        $value = !empty($value) ? Str::remove(' ', $value) : $value;
        $this->attributes['phone'] = $value === '' ? null : $value;
    }

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
