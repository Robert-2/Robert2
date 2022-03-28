<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Validation\Validator as V;
use Robert2\API\Models\Traits\Taggable;

class Company extends BaseModel
{
    use SoftDeletes;
    use Taggable;

    protected $orderField = 'legal_name';
    protected $searchField = 'legal_name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'legal_name'  => V::notEmpty()->length(1, 191),
            'street'      => V::optional(V::length(null, 191)),
            'postal_code' => V::optional(V::length(null, 10)),
            'locality'    => V::optional(V::length(null, 191)),
            'country_id'  => V::optional(V::numeric()),
            'phone'       => V::optional(V::phone()),
        ];
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

    public function getTagsAttribute()
    {
        $tags = $this->Tags()->get();
        return Tag::format($tags);
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

    public function edit($id = null, array $data = []): BaseModel
    {
        if (!empty($data['phone'])) {
            $data['phone'] = normalizePhone($data['phone']);
        }

        $company = parent::edit($id, $data);

        if (!empty($data['persons'])) {
            $this->addPersons($company['id'], $data['persons']);
        }

        if (!empty($data['tags'])) {
            $this->setTags($company['id'], $data['tags']);
        }

        return $company;
    }

    public function addPersons(int $id, array $persons)
    {
        if (empty($persons)) {
            throw new \InvalidArgumentException("Missing persons data to add to company.");
        }

        $Company = static::findOrFail($id);
        foreach ($persons as $person) {
            $person['company_id'] = $Company->id;
            $Person = new Person;
            $Person->fill($person);
            $Person->save();
        }

        return $Company->Persons;
    }
}
