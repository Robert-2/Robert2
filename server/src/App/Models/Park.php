<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
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
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAllForUser(int $userId): Builder
    {
        $builder = static::whereDoesntHave(
            'Users',
            function (Builder $query) use ($userId) {
                $query->where('user_id', $userId);
            }
        );

        return $builder;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = [
        'total_items',
        'total_stock_quantity',
        'total_amount',
    ];

    public function Materials()
    {
        return $this->hasMany('Robert2\API\Models\Material');
    }

    public function MaterialUnits()
    {
        return $this->hasMany('Robert2\API\Models\MaterialUnit');
    }

    public function Person()
    {
        return $this->belongsTo('Robert2\API\Models\Person');
    }

    public function Company()
    {
        return $this->belongsTo('Robert2\API\Models\Company');
    }

    public function Country()
    {
        return $this->belongsTo('Robert2\API\Models\Country')
            ->select(['id', 'name', 'code']);
    }

    public function Users()
    {
        return $this->belongsToMany('Robert2\API\Models\User', 'user_restricted_parks')
            ->using('Robert2\API\Models\UserRestrictedParksPivot')
            ->select(['users.id']);
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

    public function getMaterialUnitsAttribute()
    {
        $materialUnits = $this->MaterialUnits()->get();
        return $materialUnits ? $materialUnits->toArray() : [];
    }

    public function getTotalItemsAttribute()
    {
        // - Matériel (non unitaire)
        $total = $this->Materials()->where('is_unitary', false)->count();

        // - Unités
        $total += $this->MaterialUnits()->distinct()->count('material_id');

        return $total;
    }

    public function getTotalStockQuantityAttribute()
    {
        $total = 0;

        // - Matériel (non unitaire)
        $materials = $this->Materials()->get(['stock_quantity', 'is_unitary']);
        foreach ($materials as $material) {
            // - Si unitaire, ne devrait pas avoir de `park_id`.
            if ($material->is_unitary) {
                continue;
            }
            $total += (int)$material->stock_quantity;
        }

        // - Unités
        $total += $this->MaterialUnits()->count();

        return $total;
    }

    public function getTotalAmountAttribute()
    {
        $total = 0;

        // - Matériel (non unitaire)
        $materials = $this->Materials()->get(['stock_quantity', 'is_unitary', 'replacement_price']);
        foreach ($materials as $material) {
            // - Si unitaire, ne devrait pas avoir de `park_id`.
            if ($material->is_unitary) {
                continue;
            }
            $total += ($material->replacement_price * (int)$material->stock_quantity);
        }

        // - Unités
        $units = $this->MaterialUnits()->get();
        foreach ($units as $unit) {
            $total += $unit->material['replacement_price'];
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

    public function getUsersAttribute()
    {
        $users = $this->Users()->get();
        return $users ? $users->toArray() : null;
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
