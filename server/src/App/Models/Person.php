<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Traits\Serializer;
use Robert2\API\Validation\Validator as V;

class Person extends BaseModel implements Serializable
{
    use Serializer;

    protected $table = 'persons';

    protected $allowedSearchFields = ['full_name', 'email'];
    protected $searchField = 'full_name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'user_id' => V::optional(V::numeric()),
            'first_name' => V::notEmpty()->alpha(static::EXTRA_CHARS)->length(2, 35),
            'last_name' => V::notEmpty()->alpha(static::EXTRA_CHARS)->length(2, 35),
            'email' => V::callback([$this, 'checkEmail']),
            'phone' => V::optional(V::phone()),
            'street' => V::optional(V::length(null, 191)),
            'postal_code' => V::optional(V::length(null, 10)),
            'locality' => V::optional(V::length(null, 191)),
            'country_id' => V::optional(V::numeric()),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkEmail($value)
    {
        V::optional(V::email()->length(null, 191))
            ->check($value);

        if (!$value) {
            return true;
        }

        $query = static::where('email', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        return $query->exists()
            ? 'email-already-in-use'
            : true;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function beneficiary()
    {
        return $this->hasOne(Beneficiary::class);
    }

    public function technician()
    {
        return $this->hasOne(Technician::class);
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
        'full_name',
        'full_address',
        'country',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'first_name' => 'string',
        'last_name' => 'string',
        'email' => 'string',
        'phone' => 'string',
        'street' => 'string',
        'postal_code' => 'string',
        'locality' => 'string',
        'country_id' => 'integer',
    ];

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getCountryAttribute()
    {
        return $this->country()->first();
    }

    public function getFullAddressAttribute()
    {
        $addressParts = [];
        $addressParts[] = trim($this->street ?? '');
        $addressParts[] = implode(' ', array_filter([
            trim($this->postal_code ?? ''),
            trim($this->locality ?? ''),
        ]));
        return implode("\n", array_filter($addressParts));
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'street',
        'postal_code',
        'locality',
        'country_id',
    ];

    // ------------------------------------------------------
    // -
    // -    Search / Order related
    // -
    // ------------------------------------------------------

    protected function _getOrderBy(?Builder $builder = null): Builder
    {
        $builder = $builder ?? static::query();

        $direction = $this->orderDirection ?: 'asc';
        $order = $this->orderField ?: 'full_name';

        if ($order !== 'full_name') {
            return $builder->orderBy($order, $direction);
        }

        return $builder
            ->orderBy('last_name', $direction)
            ->orderBy('first_name', $direction);
    }

    protected function _setSearchConditions(Builder $builder): Builder
    {
        if (!$this->searchField || !$this->searchTerm) {
            return $builder;
        }
        $term = sprintf('%%%s%%', addcslashes($this->searchTerm, '%_'));

        if ($this->searchField === 'full_name') {
            return $builder->where(function (Builder $query) use ($term) {
                $query
                    ->orWhere('last_name', 'LIKE', $term)
                    ->orWhere('first_name', 'LIKE', $term)
                    ->orWhereRaw('CONCAT(last_name, \' \', first_name) LIKE ?', [$term])
                    ->orWhereRaw('CONCAT(first_name, \' \', last_name) LIKE ?', [$term]);
            });
        }

        return $builder->where($this->searchField, 'LIKE', $term);
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
        );

        return $data;
    }

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
    // -
    // ------------------------------------------------------

    public static function staticEdit($id = null, array $data = []): BaseModel
    {
        if (!empty($data['phone'])) {
            $data['phone'] = normalizePhone($data['phone']);
        }
        return parent::staticEdit($id, $data);
    }
}
