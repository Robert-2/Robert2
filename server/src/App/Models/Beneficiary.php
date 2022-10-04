<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Adbar\Dot as DotArray;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Traits\Serializer;
use Robert2\API\Validation\Validator as V;

class Beneficiary extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletes;

    protected $table = 'beneficiaries';

    protected $allowedSearchFields = [
        'everywhere',
        'full_name',
        'reference',
        'email',
    ];
    protected $searchField = 'everywhere';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            // Note: Le champ `person_id` est requis mais peuplé après coup par la relation
            //       d'ou le `optional` pour ne valider que si il est directement spécifié.
            'person_id' => V::optional(V::numeric()),
            'reference' => V::callback([$this, 'checkReference']),
            'company_id' => V::optional(V::numeric()),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

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
    ];

    public function getFirstNameAttribute(): string
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' +
                'this relation should always be defined.'
            );
        }
        return $this->person->first_name;
    }

    public function getLastNameAttribute(): string
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' +
                'this relation should always be defined.'
            );
        }
        return $this->person->last_name;
    }

    public function getFullNameAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' +
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
                'The beneficiary\'s related person is missing, ' +
                'this relation should always be defined.'
            );
        }
        return $this->person->email;
    }

    public function getPhoneAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' +
                'this relation should always be defined.'
            );
        }
        return $this->person->phone;
    }

    public function getStreetAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' +
                'this relation should always be defined.'
            );
        }
        return $this->person->street;
    }

    public function getPostalCodeAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' +
                'this relation should always be defined.'
            );
        }
        return $this->person->postal_code;
    }

    public function getLocalityAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' +
                'this relation should always be defined.'
            );
        }
        return $this->person->locality;
    }

    public function getFullAddressAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' +
                'this relation should always be defined.'
            );
        }
        return $this->person->full_address;
    }

    public function getUserIdAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' +
                'this relation should always be defined.'
            );
        }
        return $this->person->user_id;
    }

    public function getCountryIdAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' +
                'this relation should always be defined.'
            );
        }
        return $this->person->country_id;
    }

    public function getCountryAttribute()
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' +
                'this relation should always be defined.'
            );
        }
        return $this->person->country;
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
    // -    Search / Order related
    // -
    // ------------------------------------------------------

    protected function _getOrderBy(?Builder $builder = null): Builder
    {
        $builder = $builder ?? static::query();

        $order = $this->orderField;
        $direction = $this->orderDirection ?: 'asc';

        if (!in_array($order, ['full_name', 'reference', 'company', 'email'], true)) {
            $order = 'full_name';
        }

        if (!in_array($order, ['full_name', 'company', 'email'], true)) {
            return $builder->orderBy($order, $direction);
        }

        if ($order === 'company') {
            $subQuery = Company::select('legal_name')
                ->whereColumn('id', 'beneficiaries.company_id');
        } else {
            if ($order === 'full_name') {
                $subQuery = Person::selectRaw('CONCAT(last_name, \' \', first_name) as full_name');
            } else {
                $subQuery = Person::select('email');
            }
            $subQuery = $subQuery->whereColumn('id', 'beneficiaries.person_id');
        }

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
            return $builder->whereHas('person', function (Builder $query) use ($term) {
                $query->where('email', 'LIKE', $term);
            });
        }

        if ($this->searchField === 'everywhere') {
            $group = function (Builder $query) use ($term) {
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
                    ->orWhereHas('company', function (Builder $subQuery) use ($term) {
                        $subQuery->where('legal_name', 'LIKE', $term);
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
                    ->setModel(get_class(), $id);
            }
            $personId = static::find($id)->person_id;
        }

        $personData = $data['person'] ?? [];
        unset($data['person']);

        $beneficiary = static::firstOrNew(compact('id'))->fill($data);
        $person = Person::firstOrNew(['id' => $personId])->fill($personData);
        if (!$beneficiary->isValid() || !$person->isValid()) {
            throw new ValidationException(array_merge(
                $beneficiary->validationErrors(),
                ['person' => $person->validationErrors()]
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
