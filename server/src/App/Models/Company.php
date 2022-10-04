<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Traits\Serializer;
use Robert2\API\Validation\Validator as V;

class Company extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletes;

    protected $orderField = 'legal_name';
    protected $searchField = 'legal_name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'legal_name' => V::callback([$this, 'checkLegalName']),
            'street' => V::optional(V::length(null, 191)),
            'postal_code' => V::optional(V::length(null, 10)),
            'locality' => V::optional(V::length(null, 191)),
            'country_id' => V::optional(V::numeric()),
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
        if (empty($this->street) && empty($this->postal_code) && empty($this->locality)) {
            return null;
        }
        if (empty($this->postal_code) && empty($this->locality)) {
            return $this->street;
        }
        return "{$this->street}\n{$this->postal_code} {$this->locality}";
    }

    public function getCountryAttribute()
    {
        return $this->country()->first();
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
            $data['phone'] = normalizePhone($data['phone']);
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
