<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\QueryException;
use Robert2\API\Config\Config;
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
        'full_name_or_company',
        'nickname',
        'email',
    ];
    protected $searchField = 'full_name_or_company';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'user_id'     => V::optional(V::numeric()),
            'first_name'  => V::notEmpty()->alpha(static::EXTRA_CHARS)->length(2, 96),
            'last_name'   => V::notEmpty()->alpha(static::EXTRA_CHARS)->length(2, 96),
            'email'       => V::optional(V::email()->length(null, 191)),
            'phone'       => V::optional(V::phone()),
            'street'      => V::optional(V::length(null, 191)),
            'postal_code' => V::optional(V::length(null, 10)),
            'locality'    => V::optional(V::length(null, 191)),
            'country_id'  => V::optional(V::numeric()),
            'company_id'  => V::optional(V::numeric()),
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = [
        'full_name',
        'country',
        'company',
    ];

    public function User()
    {
        return $this->belongsTo('Robert2\API\Models\User')
            ->select(['id', 'pseudo', 'email', 'group_id']);
    }

    public function Country()
    {
        return $this->belongsTo('Robert2\API\Models\Country')
            ->select(['id', 'name', 'code']);
    }

    public function Company()
    {
        return $this->belongsTo('Robert2\API\Models\Company');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'user_id'     => 'integer',
        'first_name'  => 'string',
        'last_name'   => 'string',
        'nickname'    => 'string',
        'email'       => 'string',
        'phone'       => 'string',
        'street'      => 'string',
        'postal_code' => 'string',
        'locality'    => 'string',
        'country_id'  => 'integer',
        'company_id'  => 'integer',
        'note'        => 'string',
    ];

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
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
            $builder = $builder->leftJoin('companies', 'persons.company_id', '=', 'companies.id');
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

    public function edit(?int $id = null, array $data = []): Person
    {
        if ($id && !static::staticExists($id)) {
            throw (new ModelNotFoundException)
                ->setModel(get_class($this), $id);
        }

        $data = cleanEmptyFields($data);
        $data = $this->_trimStringFields($data);

        if (!empty($data['phone'])) {
            $data['phone'] = normalizePhone($data['phone']);
        }

        try {
            $person = static::firstOrNew(compact('id'));
            $person->fill($data)->validate()->save();

            if (!empty($data['tags'])) {
                $this->setTags($person->id, $data['tags']);
            }
        } catch (QueryException $e) {
            if (!isDuplicateException($e)) {
                throw (new ValidationException)
                    ->setPDOValidationException($e);
            }

            $person = static::where('email', $data['email'])->first();
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

        $diff = array_diff($defaultTags, $existingTags);
        if (empty($diff)) {
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
                $query->orWhere('first_name', 'like', $term)
                    ->orWhere('last_name', 'like', $term);
            };
            return $builder->where($group);
        }

        if ($this->searchField === 'full_name_or_company') {
            $group = function (Builder $query) use ($term) {
                $query->orWhere('first_name', 'like', $term)
                    ->orWhere('last_name', 'like', $term);
            };
            return $builder
                ->where($group)
                ->orWhereHas('company', function (Builder $subQuery) use ($term) {
                    $subQuery->where('companies.legal_name', 'like', $term);
                });
        }

        return $builder->where($this->searchField, 'like', $term);
    }
}
