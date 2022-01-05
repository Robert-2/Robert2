<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Validation\Validator as V;

class Park extends BaseModel
{
    use SoftDeletes;

    protected $orderField = 'name';
    protected $searchField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name'          => V::notEmpty()->length(2, 96),
            'person_id'     => V::optional(V::numeric()),
            'company_id'    => V::optional(V::numeric()),
            'street'        => V::optional(V::length(null, 191)),
            'postal_code'   => V::optional(V::length(null, 10)),
            'locality'      => V::optional(V::length(null, 191)),
            'country_id'    => V::optional(V::numeric()),
            'opening_hours' => V::optional(V::length(null, 255)),
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = [
        'total_items',
        'total_stock_quantity',
    ];

    public function Materials()
    {
        return $this->hasMany(Material::class);
    }

    public function Person()
    {
        return $this->belongsTo(Person::class);
    }

    public function Company()
    {
        return $this->belongsTo(Company::class);
    }

    public function Country()
    {
        return $this->belongsTo(Country::class)
            ->select(['id', 'name', 'code']);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'person_id'     => 'integer',
        'company_id'    => 'integer',
        'name'          => 'string',
        'street'        => 'string',
        'postal_code'   => 'string',
        'locality'      => 'string',
        'country_id'    => 'integer',
        'opening_hours' => 'string',
        'note'          => 'string',
    ];

    public function getMaterialsAttribute()
    {
        $materials = $this->Materials()->get();
        return $materials ? $materials->toArray() : null;
    }

    public function getTotalItemsAttribute()
    {
        return $this->Materials()->count();
    }

    public function getTotalStockQuantityAttribute()
    {
        $materials = $this->Materials()->get(['stock_quantity']);
        $total = 0;
        foreach ($materials as $material) {
            $total += (int)$material->stock_quantity;
        }
        return $total;
    }

    public function getTotalAmountAttribute()
    {
        $total = 0;

        $materials = Material::getParkAll($this->id);
        foreach ($materials as $material) {
            $total += ($material['replacement_price'] * (int)$material['stock_quantity']);
        }

        return $total;
    }

    public function getPersonAttribute()
    {
        $user = $this->Person()->first();
        return $user ? $user->toArray() : null;
    }

    public function getCompanyAttribute()
    {
        $company = $this->Company()->first();
        return $company ? $company->toArray() : null;
    }

    public function getCountryAttribute()
    {
        $country = $this->Country()->first();
        return $country ? $country->toArray() : null;
    }

    public function getHasOngoingEventAttribute()
    {
        if (!$this->exists || !$this->id) {
            return false;
        }

        $ongoingEvents = Event::inPeriod('today')
            ->with('Materials')
            ->get();

        foreach ($ongoingEvents as $ongoingEvent) {
            foreach ($ongoingEvent->materials as $material) {
                if ($material['park_id'] === $this->id) {
                    return true;
                }
            }
        }

        return false;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'name',
        'street',
        'postal_code',
        'locality',
        'country_id',
        'opening_hours',
        'note',
    ];
}
