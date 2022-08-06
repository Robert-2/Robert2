<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\QueryException;
use Robert2\API\Config\Config;
use Robert2\API\Services\I18n;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Traits\Taggable;
use Robert2\API\Validation\Validator as V;

class Person extends BaseModel
{
    use SoftDeletes;
    use Taggable;

    protected $table = 'persons';

    protected $orderField = 'last_name';

    protected $allowedSearchFields = [
        'first_name',
        'last_name',
        'full_name',
        'reference',
        'name_reference_or_company',
        'nickname',
        'email',
    ];
    protected $searchField = 'name_reference_or_company';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'user_id' => V::optional(V::numeric()),
            'first_name' => V::notEmpty()->alpha(static::EXTRA_CHARS)->length(2, 96),
            'last_name' => V::notEmpty()->alpha(static::EXTRA_CHARS)->length(2, 96),
            'reference' => V::callback([$this, 'checkReference']),
            'email' => V::callback([$this, 'checkEmail']),
            'phone' => V::optional(V::phone()),
            'street' => V::optional(V::length(null, 191)),
            'postal_code' => V::optional(V::length(null, 10)),
            'locality' => V::optional(V::length(null, 191)),
            'country_id' => V::optional(V::numeric()),
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

        if ($query->withTrashed()->exists()) {
            return 'email-already-in-use';
        }

        return true;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = [
        'full_name',
        'full_address',
        'country',
        'company',
    ];

    public function User()
    {
        return $this->belongsTo(User::class)
            ->select(['id', 'pseudo', 'email', 'group']);
    }

    public function Country()
    {
        return $this->belongsTo(Country::class)
            ->select(['id', 'name', 'code']);
    }

    public function Company()
    {
        return $this->belongsTo(Company::class);
    }

    public function Events()
    {
        return $this->hasMany(EventTechnician::class, 'technician_id')
            ->with('Event')
            ->has('Event')
            ->orderBy('start_time');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'user_id' => 'integer',
        'first_name' => 'string',
        'last_name' => 'string',
        'reference' => 'string',
        'nickname' => 'string',
        'email' => 'string',
        'phone' => 'string',
        'street' => 'string',
        'postal_code' => 'string',
        'locality' => 'string',
        'country_id' => 'integer',
        'company_id' => 'integer',
        'note' => 'string',
    ];

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getFullAddressAttribute()
    {
        if (empty($this->street) && empty($this->postal_code) && empty($this->locality)) {
            return null;
        }
        if (empty($this->postal_code) && empty($this->locality)) {
            return $this->street;
        }
        return "{$this->street}\n{$this->postal_code} {$this->locality}";
    }

    public function getUserAttribute()
    {
        $user = $this->User()->first();
        return $user ? $user->toArray() : null;
    }

    public function getCountryAttribute()
    {
        $country = $this->Country()->first();
        return $country ? $country->toArray() : null;
    }

    public function getCompanyAttribute()
    {
        $company = $this->Company()->first();
        return $company ? $company->toArray() : null;
    }

    public function getTagsAttribute()
    {
        $tags = $this->Tags()->get();
        return Tag::format($tags);
    }

    public function getEventsAttribute()
    {
        return $this->Events()->get()->each->setAppends(['event']);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    protected function _getOrderBy(?Builder $builder = null): Builder
    {
        $order = $this->orderField ?: 'id';
        if ($order === 'company') {
            $order = 'companies.legal_name';
        }
        $direction = $this->orderDirection ?: 'asc';

        if ($builder) {
            $builder = $builder->orderBy($order, $direction);
        } else {
            $builder = static::orderBy($order, $direction);
        }

        if ($order === 'companies.legal_name') {
            $builder = $builder->leftJoin('companies', 'persons.company_id', '=', 'companies.id')
                // - Hack pour éviter l'écrasement de l'ID de `Person` par celui de `Company` (voir #342)
                ->select('companies.*', 'persons.*');
        }

        return $builder;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'reference',
        'nickname',
        'email',
        'phone',
        'street',
        'postal_code',
        'locality',
        'country_id',
        'company_id',
        'note',
    ];

    public function edit($id = null, array $data = []): BaseModel
    {
        if ($id && !static::staticExists($id)) {
            throw (new ModelNotFoundException)
                ->setModel(get_class($this), $id);
        }

        if (!empty($data['phone'])) {
            $data['phone'] = normalizePhone($data['phone']);
        }

        try {
            $person = static::updateOrCreate(compact('id'), $data);

            if (!empty($data['tags'])) {
                $this->setTags($person->id, $data['tags']);
            }
        } catch (QueryException $e) {
            if (!isDuplicateException($e)) {
                throw (new ValidationException)
                    ->setPDOValidationException($e);
            }

            if (preg_match('/(persons\.)?reference/', $e->getMessage())) {
                $i18n = new I18n(Config::getSettings('defaultLang'));
                throw (new ValidationException)
                    ->setValidationErrors([
                        'reference' => [$i18n->translate('reference-already-in-use')]
                    ]);
            }

            if ($id) {
                $person = static::where('id', $id)->first();
            } elseif (array_key_exists('email', $data)) {
                $person = static::where('email', $data['email'])->first();
            } else {
                throw (new ValidationException)
                    ->setPDOValidationException($e);
            }

            $this->_setOtherTag($person);
        }

        return $person;
    }

    protected function _setOtherTag(Model $person): void
    {
        $defaultTags = array_values(Config::getSettings('defaultTags'));
        $existingTags = array_map(function ($tag) {
            return $tag['name'];
        }, $person->tags);

        $diff = array_values(array_diff($defaultTags, $existingTags));
        if (empty($diff) || empty($diff[0])) {
            return;
        }

        $this->addTag($person->id, $diff[0]);
    }

    protected function _setSearchConditions(Builder $builder): Builder
    {
        if (!$this->searchField || !$this->searchTerm) {
            return $builder;
        }

        $term = sprintf('%%%s%%', addcslashes($this->searchTerm, '%_'));

        if ($this->searchField === 'full_name') {
            $group = function (Builder $query) use ($term) {
                $query
                    ->orWhere('first_name', 'like', $term)
                    ->orWhere('last_name', 'like', $term);
            };
            return $builder->where($group);
        }

        if ($this->searchField === 'name_reference_or_company') {
            $group = function (Builder $query) use ($term) {
                $subgroup = function (Builder $query) use ($term) {
                    $query
                        ->orWhere('first_name', 'like', $term)
                        ->orWhere('last_name', 'like', $term)
                        ->orWhere('nickname', 'like', $term)
                        ->orWhere('reference', 'like', $term);
                };

                $query
                    ->where($subgroup)
                    ->orWhereHas('company', function (Builder $subQuery) use ($term) {
                        $subQuery->where('companies.legal_name', 'like', $term);
                    });
            };
            return $builder->where($group);
        }

        return $builder->where($this->searchField, 'like', $term);
    }
}
