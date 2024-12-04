<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Loxya\Contracts\Serializable;
use Loxya\Models\Traits\Serializer;
use Loxya\Support\Assert;
use Respect\Validation\Validator as V;

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
 * @property-read Collection<array-key, Beneficiary> $beneficiaries
 *
 * @method static Builder|static search(string $term)
 */
final class Company extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletes;

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

        $alreadyExists = static::query()
            ->where('legal_name', $value)
            ->when($this->exists, fn (Builder $subQuery) => (
                $subQuery->where('id', '!=', $this->id)
            ))
            ->withTrashed()
            ->exists();

        return !$alreadyExists ?: 'company-legal-name-already-in-use';
    }

    public function checkCountryId($value)
    {
        V::nullable(V::intVal())->check($value);

        return $value !== null
            ? Country::includes($value)
            : true;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function beneficiaries(): HasMany
    {
        return $this->hasMany(Beneficiary::class)
            ->orderBy('id');
    }

    public function country(): BelongsTo
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

    public function getFullAddressAttribute(): string|null
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

    public function getCountryAttribute(): Country|null
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

    public function setPhoneAttribute(mixed $value): void
    {
        $value = !empty($value) ? Str::remove(' ', $value) : $value;
        $this->attributes['phone'] = $value === '' ? null : $value;
    }

    // ------------------------------------------------------
    // -
    // -    Query Scopes
    // -
    // ------------------------------------------------------

    protected $orderable = [
        'legal_name',
    ];

    public function scopeSearch(Builder $query, string $term): Builder
    {
        Assert::minLength($term, 2, "The term must contain more than two characters.");

        $term = sprintf('%%%s%%', addcslashes($term, '%_'));
        return $query->where('legal_name', 'LIKE', $term);
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(): array
    {
        /** @var Company $company */
        $company = tap(clone $this, static function (Company $company) {
            $company->append(['country']);
        });

        return (new DotArray($company->attributesForSerialization()))
            ->delete(['created_at', 'updated_at', 'deleted_at'])
            ->all();
    }
}
