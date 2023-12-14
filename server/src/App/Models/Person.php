<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Loxya\Contracts\Serializable;
use Loxya\Models\Traits\Serializer;
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
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
 *
 * @property-read Beneficiary $beneficiary
 * @property-read Technician $technician
 */
final class Person extends BaseModel implements Serializable
{
    use Serializer;

    protected $table = 'persons';

    protected $orderField = 'full_name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'user_id' => V::custom([$this, 'checkUserId']),
            'first_name' => V::notEmpty()->alnum(static::EXTRA_CHARS)->length(2, 35),
            'last_name' => V::notEmpty()->alnum(static::EXTRA_CHARS)->length(2, 35),
            'email' => V::optional(V::email()->length(null, 191)),
            'phone' => V::optional(V::phone()),
            'street' => V::optional(V::length(null, 191)),
            'postal_code' => V::optional(V::length(null, 10)),
            'locality' => V::optional(V::length(null, 191)),
            'country_id' => V::custom([$this, 'checkCountryId']),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkUserId($value)
    {
        V::optional(V::numericVal())->check($value);

        return $value !== null
            ? User::staticExists($value)
            : true;
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
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
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

    public function setPhoneAttribute($value): void
    {
        $value = !empty($value) ? Str::remove(' ', $value) : $value;
        $this->attributes['phone'] = $value === '' ? null : $value;
    }

    // ------------------------------------------------------
    // -
    // -    Query Scopes
    // -
    // ------------------------------------------------------

    public function scopeSearch(Builder $query, string $term): Builder
    {
        $term = trim($term);
        if (strlen($term) < 2) {
            throw new \InvalidArgumentException("The term must contain more than two characters.");
        }

        $term = sprintf('%%%s%%', addcslashes($term, '%_'));
        return $query->where(function (Builder $query) use ($term) {
            $query
                ->orWhere('last_name', 'LIKE', $term)
                ->orWhere('first_name', 'LIKE', $term)
                ->orWhereRaw('CONCAT(last_name, \' \', first_name) LIKE ?', [$term])
                ->orWhereRaw('CONCAT(first_name, \' \', last_name) LIKE ?', [$term]);
        });
    }

    public function scopeCustomOrderBy(Builder $query, string $column, string $direction = 'asc'): Builder
    {
        if ($column !== 'full_name') {
            return parent::scopeCustomOrderBy($query, $column, $direction);
        }

        return $query
            ->orderBy('last_name', $direction)
            ->orderBy('first_name', $direction);
    }

    // ------------------------------------------------------
    // -
    // -    Custom Methods
    // -
    // ------------------------------------------------------

    /**
     * Supprime la personne si celle-ci est "orpheline", c'est à dire sans bénéficiaire,
     * sans technicien ni utilisateur (sauf si $checkUser est passé à `false`).
     *
     * @param bool $checkUser Est-ce qu'on veut vérifier que la personne a un utilisateur lié ?
     *                        Dans le cas de la suppression d'un utilisateur, passer ce paramètre
     *                        à `false` pour pouvoir supprimer également son profil.
     */
    public function deleteIfOrphan(bool $checkUser = true): void
    {
        $isOrphan = !$this->beneficiary && !$this->technician;
        if ($checkUser) {
            $isOrphan = $isOrphan && $this->user_id === null;
        }

        if (!$isOrphan) {
            return;
        }

        $this->delete();
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(): array
    {
        return (new DotArray($this->attributesForSerialization()))
            ->delete(['created_at', 'updated_at'])
            ->all();
    }
}
