<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Loxya\Contracts\Serializable;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\Traits\Serializer;
use Loxya\Models\Traits\SoftDeletable;
use Loxya\Support\Assert;
use Respect\Validation\Validator as V;

/**
 * Bénéficiaire / emprunteur.
 *
 * @property-read ?int $id
 * @property int $person_id
 * @property-read Person $person
 * @property-read int|null $user_id
 * @property-read User|null $user
 * @property string|null $reference
 * @property-read string $first_name
 * @property-read string $last_name
 * @property-read string $full_name
 * @property int|null $company_id
 * @property-read Company|null $company
 * @property-read string|null $email
 * @property-read string|null $phone
 * @property-read string|null $street
 * @property-read string|null $postal_code
 * @property-read string|null $locality
 * @property-read int|null $country_id
 * @property-read Country|null $country
 * @property-read string|null $full_address
 * @property string|null $note
 * @property-read array $stats
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
 * @property-read CarbonImmutable|null $deleted_at
 *
 * @property-read Collection<array-key, Event> $events
 * @property-read Collection<array-key, Estimate> $estimates
 * @property-read Collection<array-key, Invoice> $invoices
 *
 * @method static Builder|static search(string $term)
 */
final class Beneficiary extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletable;

    // - Types de sérialisation.
    public const SERIALIZE_DEFAULT = 'default';
    public const SERIALIZE_DETAILS = 'details';

    protected $table = 'beneficiaries';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'person_id' => V::custom([$this, 'checkPersonId']),
            'reference' => V::custom([$this, 'checkReference']),
            'company_id' => V::custom([$this, 'checkCompanyId']),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkPersonId($value)
    {
        // - L'identifiant de la personne n'est pas encore défini, on skip.
        if (!$this->exists && $value === null) {
            return true;
        }

        if (!Person::staticExists($value)) {
            return false;
        }

        $alreadyExists = static::query()
            ->where('person_id', $value)
            ->when($this->exists, fn (Builder $subQuery) => (
                $subQuery->where('id', '!=', $this->id)
            ))
            ->withTrashed()
            ->exists();

        return !$alreadyExists ?: 'person-already-a-beneficiary';
    }

    public function checkReference($value)
    {
        V::optional(V::length(null, 191))
            ->check($value);

        if (!$value) {
            return true;
        }

        $alreadyExists = static::query()
            ->where('reference', $value)
            ->when($this->exists, fn (Builder $subQuery) => (
                $subQuery->where('id', '!=', $this->id)
            ))
            ->withTrashed()
            ->exists();

        return !$alreadyExists ?: 'reference-already-in-use';
    }

    public function checkCompanyId($value)
    {
        V::optional(V::numericVal())->check($value);

        if ($value === null) {
            return true;
        }

        $company = Company::withTrashed()->find($value);
        if (!$company) {
            return false;
        }

        return !$this->exists || $this->isDirty('company_id')
            ? !$company->trashed()
            : true;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function person()
    {
        return $this->belongsTo(Person::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_beneficiaries');
    }

    public function estimates()
    {
        return $this->hasMany(Estimate::class, 'beneficiary_id')
            ->orderBy('date', 'desc');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'beneficiary_id')
            ->orderBy('date', 'desc');
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $appends = [
        'first_name',
        'last_name',
        'full_name',
        'email',
        'phone',
        'street',
        'postal_code',
        'locality',
        'full_address',
        'country_id',
        'user_id',
    ];

    protected $casts = [
        'reference' => 'string',
        'person_id' => 'integer',
        'company_id' => 'integer',
        'note' => 'string',
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
        'deleted_at' => 'immutable_datetime',
    ];

    public function getFirstNameAttribute(): string
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->first_name;
    }

    public function getLastNameAttribute(): string
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->last_name;
    }

    public function getFullNameAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->full_name;
    }

    public function getCompanyAttribute()
    {
        return $this->getRelationValue('company');
    }

    public function getEmailAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->user?->email ?? $this->person->email;
    }

    public function getPhoneAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->phone;
    }

    public function getStreetAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->street;
    }

    public function getPostalCodeAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->postal_code;
    }

    public function getLocalityAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->locality;
    }

    public function getCountryIdAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->country_id;
    }

    public function getCountryAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->country;
    }

    public function getFullAddressAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->full_address;
    }

    public function getUserIdAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->user_id;
    }

    public function getUserAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->user;
    }

    public function getStatsAttribute()
    {
        $events = $this->events;

        return [
            'borrowings' => $events->count(),
        ];
    }

    public function getEstimatesAttribute()
    {
        return $this->getRelationValue('estimates');
    }

    public function getInvoicesAttribute()
    {
        return $this->getRelationValue('invoices');
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'reference',
        'person_id',
        'company_id',
        'note',
    ];

    // ------------------------------------------------------
    // -
    // -    Query Scopes
    // -
    // ------------------------------------------------------

    protected $orderable = [
        'full_name',
        'reference',
        'company',
        'email',
    ];

    public function scopeSearch(Builder $query, string $term): Builder
    {
        Assert::minLength($term, 2, "The term must contain more than two characters.");

        $term = sprintf('%%%s%%', addcslashes($term, '%_'));
        return $query->where(static function (Builder $query) use ($term) {
            $query
                ->orWhere(static function (Builder $subQuery) use ($term) {
                    $subQuery->where('reference', 'LIKE', $term);
                })
                ->orWhereHas('person', static function (Builder $subQuery) use ($term) {
                    $subQuery
                        ->where('first_name', 'LIKE', $term)
                        ->orWhere('last_name', 'LIKE', $term)
                        ->orWhereRaw('CONCAT(last_name, \' \', first_name) LIKE ?', [$term])
                        ->orWhereRaw('CONCAT(first_name, \' \', last_name) LIKE ?', [$term])
                        ->orWhere('email', 'LIKE', $term);
                })
                ->orWhereRelation('company', 'legal_name', 'LIKE', $term);
        });
    }

    public function scopeCustomOrderBy(Builder $query, string $column, string $direction = 'asc'): Builder
    {
        if (!in_array($column, ['full_name', 'reference', 'company', 'email'], true)) {
            throw new \InvalidArgumentException("Invalid order field.");
        }

        if (!in_array($column, ['full_name', 'company', 'email'], true)) {
            return $query->orderBy($column, $direction);
        }

        $subQuery = match ($column) {
            'company' => (
                Company::select('legal_name')
                    ->whereColumn('id', 'beneficiaries.company_id')
            ),
            'full_name' => (
                Person::selectRaw('CONCAT(last_name, \' \', first_name) as full_name')
                    ->whereColumn('id', 'beneficiaries.person_id')
            ),
            'email' => (
                Person::select('email')
                    ->whereColumn('id', 'beneficiaries.person_id')
            ),
        };

        return $query->orderBy($subQuery, $direction);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes de "repository"
    // -
    // ------------------------------------------------------

    public static function staticEdit($id = null, array $data = []): static
    {
        $personId = null;
        if ($id) {
            if (!static::staticExists($id)) {
                throw (new ModelNotFoundException())
                    ->setModel(self::class, $id);
            }
            $personId = static::find($id)->person_id;
        }

        $personData = $data['person'] ?? [];
        unset($data['person']);

        unset($data['user']);

        $beneficiary = static::firstOrNew(compact('id'))->fill($data);
        $person = Person::firstOrNew(['id' => $personId])->fill($personData);

        if (!$beneficiary->isValid() || !$person->isValid()) {
            throw new ValidationException(array_merge(
                $beneficiary->validationErrors(),
                ['person' => $person->validationErrors()],
            ));
        }

        return dbTransaction(static function () use ($person, $beneficiary) {
            if (!$person->save()) {
                throw new \RuntimeException("Unable to save the beneficiary's related person.");
            }
            $beneficiary->person()->associate($person);

            if (!$beneficiary->save()) {
                throw new \RuntimeException("Unable to save the beneficiary.");
            }

            return $beneficiary->refresh();
        });
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(string $format = self::SERIALIZE_DEFAULT): array
    {
        /** @var Beneficiary $beneficiary */
        $beneficiary = tap(clone $this, static function (Beneficiary $beneficiary) use ($format) {
            $beneficiary->append(['country', 'company']);

            if ($format === self::SERIALIZE_DETAILS) {
                $beneficiary->append(['user', 'stats']);
            }
        });

        return (new DotArray($beneficiary->attributesForSerialization()))
            ->delete([
                'can_make_reservation',
                'person_id',
                'created_at',
                'updated_at',
                'deleted_at',
            ])
            ->all();
    }

    public static function serializeValidation(array $data): array
    {
        $data = new DotArray($data);

        $personFields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'street',
            'postal_code',
            'locality',
            'country_id',
        ];
        foreach ($personFields as $field) {
            $originalPath = sprintf('person.%s', $field);
            if ($data->has($originalPath) && !$data->has($field)) {
                $data->set($field, $data->get($originalPath));
            }
            $data->delete($originalPath);
        }

        if ($data->isEmpty('person')) {
            $data->delete('person');
        }

        $userFields = ['pseudo', 'email', 'password', 'group'];
        foreach ($userFields as $field) {
            $originalPath = sprintf('user.%s', $field);
            if ($data->has($originalPath) && !$data->has($field)) {
                $data->set($field, $data->get($originalPath));
            }
            $data->delete($originalPath);
        }

        if ($data->isEmpty('user')) {
            $data->delete('user');
        }

        return $data->all();
    }

    public static function unserialize(array $data): array
    {
        $data = new DotArray($data);

        // - On supprime les éventuels sous-object `person` et `user` dans le payload,
        //   non attendus sous cette forme (les données de la personne liée et de
        //   l'utilisateur lié doivent être fusionnées avec les données du bénéficiaire).
        $data->delete(['person', 'person_id', 'user', 'user_id']);

        if ($data->has('email')) {
            $data->set('person.email', $data->get('email'));
            $data->set('user.email', $data->get('email'));
            $data->delete('email');
        }

        $personFields = [
            'first_name',
            'last_name',
            'phone',
            'street',
            'postal_code',
            'locality',
            'country_id',
        ];
        foreach ($personFields as $field) {
            $originalPath = sprintf('person.%s', $field);
            if ($data->has($field)) {
                $data->set($originalPath, $data->get($field));
                $data->delete($field);
            }
        }

        $userFields = ['pseudo', 'password'];
        foreach ($userFields as $field) {
            $originalPath = sprintf('user.%s', $field);
            if ($data->has($field)) {
                $data->set($originalPath, $data->get($field));
                $data->delete($field);
            }
        }

        return $data->all();
    }
}
