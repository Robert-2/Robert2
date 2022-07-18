<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Validation\Validator as V;

class Company extends BaseModel
{
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

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = [
        'full_address',
        'country'
    ];

    public function Persons()
    {
        return $this->hasMany(Person::class);
    }

    public function Country()
    {
        return $this->belongsTo(Country::class);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'legal_name'  => 'string',
        'street'      => 'string',
        'postal_code' => 'string',
        'locality'    => 'string',
        'country_id'  => 'integer',
        'phone'       => 'string',
        'note'        => 'string',
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

    public function getPersonsAttribute()
    {
        return $this->Persons()->get()->toArray();
    }

    public function getCountryAttribute()
    {
        $country = $this->Country()->select(['id', 'name', 'code'])->first();
        return $country ? $country->toArray() : null;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

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

        $company = parent::staticEdit($id, $data);

        if (!empty($data['persons'])) {
            $persons = [];
            foreach ($data['persons'] as $personData) {
                $persons[] = Person::firstOrNew($personData);
            }
            $company->Persons()->saveMany($persons);
        }

        return $company;
    }
}
