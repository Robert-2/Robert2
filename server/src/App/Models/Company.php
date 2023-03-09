<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Traits\Serializer;
use Respect\Validation\Validator as V;
use Robert2\API\Models\Traits\SoftDeletable;

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
 * @property-read Carbon $created_at
 * @property-read Carbon|null $updated_at
 * @property-read Carbon|null $deleted_at
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
            'country_id' => V::optional(V::numericVal()),
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

        if ($query->withTrashed()->exists()) {
            return 'company-legal-name-already-in-use';
        }

        return true;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function beneficiaries()
    {
        return $this->hasMany(Beneficiary::class);
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

    public static function staticEdit($id = null, array $data = []): BaseModel
    {
        if (!empty($data['phone'])) {
            $data['phone'] = Str::remove(' ', $data['phone']);
        }
        return parent::staticEdit($id, $data);
    }

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
