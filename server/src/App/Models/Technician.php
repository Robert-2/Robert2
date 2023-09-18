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
use Respect\Validation\Validator as V;
use Loxya\Models\Traits\SoftDeletable;

/**
 * Technicien.
 *
 * @property-read ?int $id
 * @property int $person_id
 * @property-read Person $person
 * @property-read int|null $user_id
 * @property-read User|null $user
 * @property-read string $first_name
 * @property-read string $last_name
 * @property string|null $nickname
 * @property-read string $full_name
 * @property-read string|null $email
 * @property-read string|null $phone
 * @property-read string|null $street
 * @property-read string|null $postal_code
 * @property-read string|null $locality
 * @property-read int|null $country_id
 * @property-read Country|null $country
 * @property-read string|null $full_address
 * @property string|null $note
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
 * @property-read CarbonImmutable|null $deleted_at
 *
 * @property-read Collection|EventTechnician[] $assignments
 * @property-read Collection|Document[] $documents
 */
final class Technician extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletable;

    /** L'identifiant unique du modèle. */
    public const TYPE = 'technician';

    protected $table = 'technicians';

    protected $orderField = 'full_name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'person_id' => V::custom([$this, 'checkPersonId']),
            'nickname' => V::optional(V::length(null, 30)),
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

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function person()
    {
        return $this->belongsTo(Person::class);
    }

    public function assignments()
    {
        return $this->hasMany(EventTechnician::class, 'technician_id')
            ->with('event')
            ->has('event')
            ->orderBy('start_time');
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'entity')
            ->orderBy('name', 'asc');
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
        'country',
        'country_id',
        'user_id',
    ];

    protected $casts = [
        'nickname' => 'string',
        'is_preparer' => 'boolean',
        'person_id' => 'integer',
        'note' => 'string',
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
        'deleted_at' => 'immutable_datetime',
    ];

    public function getFirstNameAttribute(): string
    {
        if (!$this->person) {
            throw new \LogicException(
                'The technician\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->first_name;
    }

    public function getLastNameAttribute(): string
    {
        if (!$this->person) {
            throw new \LogicException(
                'The technician\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->last_name;
    }

    public function getFullNameAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The technician\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->full_name;
    }

    public function getEmailAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The technician\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->email;
    }

    public function getPhoneAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The technician\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->phone;
    }

    public function getStreetAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The technician\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->street;
    }

    public function getPostalCodeAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The technician\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->postal_code;
    }

    public function getLocalityAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The technician\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->locality;
    }

    public function getCountryIdAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The technician\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->country_id;
    }

    public function getCountryAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The technician\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->country;
    }

    public function getFullAddressAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The technician\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->full_address;
    }

    public function getUserIdAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The technician\'s related person is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->person->user_id;
    }

    public function getUserAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The technician\'s related person is missing, ' .
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
        'nickname',
        'person_id',
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
                ->where(function (Builder $subQuery) use ($term) {
                    $subQuery->where('nickname', 'LIKE', $term);
                })
                ->orWhereHas('person', function (Builder $subQuery) use ($term) {
                    $subQuery
                        ->where('first_name', 'LIKE', $term)
                        ->orWhere('last_name', 'LIKE', $term)
                        ->orWhereRaw('CONCAT(last_name, \' \', first_name) LIKE ?', [$term])
                        ->orWhereRaw('CONCAT(first_name, \' \', last_name) LIKE ?', [$term])
                        ->orWhere('email', 'LIKE', $term);
                });
        });
    }

    public function scopeCustomOrderBy(Builder $query, string $column, string $direction = 'asc'): Builder
    {
        if (!in_array($column, ['full_name', 'email', 'nickname'], true)) {
            throw new \InvalidArgumentException("Invalid order field.");
        }

        if (!in_array($column, ['full_name', 'email'], true)) {
            return $query->orderBy($column, $direction);
        }

        if ($column === 'full_name') {
            $subQuery = Person::selectRaw('CONCAT(last_name, \' \', first_name) as full_name');
        } else {
            $subQuery = Person::select('email');
        }
        $subQuery = $subQuery->whereColumn('id', 'technicians.person_id');

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

        $technician = static::firstOrNew(compact('id'))->fill($data);
        $person = Person::firstOrNew(['id' => $personId])->fill($personData);
        if (!$technician->isValid() || !$person->isValid()) {
            throw new ValidationException(array_merge(
                $technician->validationErrors(),
                ['person' => $person->validationErrors()]
            ));
        }

        return dbTransaction(function () use ($person, $technician) {
            if (!$person->save()) {
                throw new \RuntimeException("Unable to save the technician's related person.");
            }
            $technician->person()->associate($person);

            if (!$technician->save()) {
                throw new \RuntimeException("Unable to save the technician.");
            }

            return $technician->refresh();
        });
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

        return $data->all();
    }

    public static function unserialize(array $data): array
    {
        $data = new DotArray($data);

        // - On supprime l'éventuel sous-object `person` dans le payload, non attendu sous cette forme.
        //   (les données de la personne liée sont fusionnées avec les données du bénéficiaire)
        $data->delete(['person', 'person_id']);

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
            if ($data->has($field)) {
                $data->set($originalPath, $data->get($field));
                $data->delete($field);
            }
        }

        return $data->all();
    }
}
