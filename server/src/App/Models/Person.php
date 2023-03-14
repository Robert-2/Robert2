<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Traits\Serializer;
use Respect\Validation\Validator as V;

/**
 * Une personne.
 *
 * @property-read ?int $id
 * @property int|null $user_id
 * @property-read User|null $user
 * @property string $first_name
 * @property string $last_name
 * @property-read string $full_name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $street
 * @property string|null $postal_code
 * @property string|null $locality
 * @property int|null $country_id
 * @property-read Country|null $country
 * @property-read string|null $full_address
 * @property-read Carbon $created_at
 * @property-read Carbon|null $updated_at
 *
 * @property-read Beneficiary $beneficiary
 * @property-read Technician $technician
 */
final class Person extends BaseModel implements Serializable
{
    use Serializer;

    protected $table = 'persons';

    protected $allowedSearchFields = ['full_name', 'email'];
    protected $searchField = 'full_name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'user_id' => V::optional(V::numericVal()),
            'first_name' => V::notEmpty()->alnum(static::EXTRA_CHARS)->length(2, 35),
            'last_name' => V::notEmpty()->alnum(static::EXTRA_CHARS)->length(2, 35),
            'email' => V::custom([$this, 'checkEmail']),
            'phone' => V::optional(V::phone()),
            'street' => V::optional(V::length(null, 191)),
            'postal_code' => V::optional(V::length(null, 10)),
            'locality' => V::optional(V::length(null, 191)),
            'country_id' => V::optional(V::numericVal()),
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
        return $this->getRelationValue('country');
    }

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

        /** @var Builder $builder */
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
            $data['phone'] = Str::remove(' ', $data['phone']);
        }
        return parent::staticEdit($id, $data);
    }
}
