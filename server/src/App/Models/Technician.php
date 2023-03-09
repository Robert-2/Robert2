<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Adbar\Dot as DotArray;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Errors\Exception\ValidationException;
use Robert2\API\Models\Traits\Serializer;
use Respect\Validation\Validator as V;
use Robert2\API\Models\Traits\SoftDeletable;

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
 * @property-read Carbon $created_at
 * @property-read Carbon|null $updated_at
 * @property-read Carbon|null $deleted_at
 *
 * @property-read Collection|EventTechnician[] $assignments
 */
final class Technician extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletable;

    protected $table = 'technicians';

    protected $allowedSearchFields = [
        'everywhere',
        'full_name',
        'nickname',
        'email',
    ];
    protected $searchField = 'everywhere';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            // Note: Le champ `person_id` est requis mais peuplé après coup par la relation
            //       d'ou le `optional` pour ne valider que si il est directement spécifié.
            'person_id' => V::optional(V::numericVal()),
            'nickname' => V::optional(V::length(null, 30)),
        ];
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
        'person_id' => 'integer',
        'note' => 'string',
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
    // -    Search / Order related
    // -
    // ------------------------------------------------------

    protected function _getOrderBy(?Builder $builder = null): Builder
    {
        $builder = $builder ?? static::query();

        $order = $this->orderField;
        $direction = $this->orderDirection ?: 'asc';

        if (!in_array($order, ['full_name', 'email', 'nickname'], true)) {
            $order = 'full_name';
        }

        if (!in_array($order, ['full_name', 'email'], true)) {
            return $builder->orderBy($order, $direction);
        }

        if ($order === 'full_name') {
            $subQuery = Person::selectRaw('CONCAT(last_name, \' \', first_name) as full_name');
        } else {
            $subQuery = Person::select('email');
        }

        $subQuery = $subQuery->whereColumn('id', 'technicians.person_id');

        /** @var Builder $builder */
        return $builder->orderBy($subQuery, $direction);
    }

    protected function _setSearchConditions(Builder $builder): Builder
    {
        if (!$this->searchField || !$this->searchTerm) {
            return $builder;
        }
        $term = sprintf('%%%s%%', addcslashes($this->searchTerm, '%_'));

        if ($this->searchField === 'full_name') {
            return $builder->whereHas('person', function (Builder $query) use ($term) {
                $query
                    ->where('first_name', 'LIKE', $term)
                    ->orWhere('last_name', 'LIKE', $term)
                    ->orWhereRaw('CONCAT(last_name, \' \', first_name) LIKE ?', [$term])
                    ->orWhereRaw('CONCAT(first_name, \' \', last_name) LIKE ?', [$term]);
            });
        }

        if ($this->searchField === 'email') {
            return $builder->whereRelation('person', 'email', 'LIKE', $term);
        }

        if ($this->searchField === 'everywhere') {
            $group = function (Builder $query) use ($term) {
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
            };
            return $builder->where($group);
        }

        return $builder->where($this->searchField, 'LIKE', $term);
    }

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
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
