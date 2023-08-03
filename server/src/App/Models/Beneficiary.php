<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Loxya\Contracts\Serializable;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\Traits\Serializer;
use Respect\Validation\Validator as V;
use Loxya\Models\Traits\SoftDeletable;

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
 * @property bool $can_make_reservation
 * @property string|null $note
 * @property-read Carbon $created_at
 * @property-read Carbon|null $updated_at
 * @property-read Carbon|null $deleted_at
 */
final class Beneficiary extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletable;

    // - Types de sérialisation.
    public const SERIALIZE_DEFAULT = 'default';
    public const SERIALIZE_DETAILS = 'details';

    protected $table = 'beneficiaries';

    protected $orderField = 'full_name';

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
        return Person::staticExists($value);
    }

    public function checkReference($value)
    {
        V::optional(V::length(null, 191))
            ->check($value);

        if (!$value) {
            return true;
        }

        $query = static::where('reference', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        if ($query->withTrashed()->exists()) {
            return 'reference-already-in-use';
        }

        return true;
    }

    public function checkCompanyId($value)
    {
        V::optional(V::numericVal())->check($value);

        if ($value === null) {
            return true;
        }

        $company = Company::find($value);
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
        'company',
        'country',
        'country_id',
        'user_id',
    ];

    protected $casts = [
        'reference' => 'string',
        'person_id' => 'integer',
        'company_id' => 'integer',
        'note' => 'string',
        'can_make_reservation' => 'boolean',
    ];

    public function getFirstNameAttribute(): string
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->first_name;
    }

    public function getLastNameAttribute(): string
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->last_name;
    }

    public function getFullNameAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.'
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
                'this relation should always be defined.'
            );
        }
        return $this->person->email;
    }

    public function getPhoneAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->phone;
    }

    public function getStreetAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->street;
    }

    public function getPostalCodeAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->postal_code;
    }

    public function getLocalityAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->locality;
    }

    public function getCountryIdAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->country_id;
    }

    public function getCountryAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->country;
    }

    public function getFullAddressAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->full_address;
    }

    public function getUserIdAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->user_id;
    }

    public function getUserAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->user;
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

    public function scopeSearch(Builder $query, string $term): Builder
    {
        $term = trim($term);
        if (strlen($term) < 2) {
            throw new \InvalidArgumentException("The term must contain more than two characters.");
        }

        $term = sprintf('%%%s%%', addcslashes($term, '%_'));
        return $query->where(function (Builder $query) use ($term) {
            $query
                ->orWhere(function (Builder $subQuery) use ($term) {
                    $subQuery->where('reference', 'LIKE', $term);
                })
                ->orWhereHas('person', function (Builder $subQuery) use ($term) {
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

    public static function staticEdit($id = null, array $data = []): BaseModel
    {
        $personId = null;
        if ($id) {
            if (!static::staticExists($id)) {
                throw (new ModelNotFoundException)
                    ->setModel(self::class, $id);
            }
            $personId = static::find($id)->person_id;
        }

        $personData = $data['person'] ?? [];
        unset($data['person']);

        $userData = $data['user'] ?? [];
        unset($data['user']);

        $beneficiary = static::firstOrNew(compact('id'))->fill($data);
        $person = Person::firstOrNew(['id' => $personId])->fill($personData);

        if (!$beneficiary->isValid() || !$person->isValid()) {
            throw new ValidationException(array_merge(
                $beneficiary->validationErrors(),
                ['person' => $person->validationErrors()],
            ));
        }

        return dbTransaction(function () use ($person, $beneficiary) {
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
        $beneficiary = tap(clone $this, function (Beneficiary $beneficiary) use ($format) {
            if ($format === self::SERIALIZE_DETAILS) {
                $beneficiary->append('user');
            }
        });

        $data = $beneficiary->attributesForSerialization();

        unset(
            $data['person_id'],
            $data['created_at'],
            $data['updated_at'],
            $data['deleted_at'],
        );

        return $data;
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
