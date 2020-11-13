<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\QueryException;
use Respect\Validation\Validator as V;

use Robert2\API\Errors;
use Robert2\API\Models\Traits\Taggable;

class Person extends BaseModel
{
    use SoftDeletes;
    use Taggable;

    protected $table = 'persons';

    protected $_modelName = 'Person';
    protected $_orderField = 'first_name';
    protected $_orderDirection = 'asc';

    protected $_allowedSearchFields = ['full_name', 'first_name', 'last_name', 'nickname', 'email'];
    protected $_searchField = 'full_name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'user_id'     => V::optional(V::numeric()),
            'first_name'  => V::notEmpty()->alpha(self::EXTRA_CHARS)->length(2, 96),
            'last_name'   => V::notEmpty()->alpha(self::EXTRA_CHARS)->length(2, 96),
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
        $order = $this->_orderField ?: 'id';
        if ($order === 'company') {
            $order = 'companies.legal_name';
        }
        $direction = $this->_orderDirection ?: 'asc';

        if ($builder) {
            $builder = $builder->orderBy($order, $direction);
        } else {
            $builder = self::orderBy($order, $direction);
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

    public function edit(?int $id = null, array $data = []): Model
    {
        if (!empty($data['phone'])) {
            $data['phone'] = normalizePhone($data['phone']);
        }

        if ($id && !$this->exists($id)) {
            throw new Errors\NotFoundException("Edit model $this->_modelName failed, entity not found.");
        }

        $data = cleanEmptyFields($data);

        $onlyFields = $id ? array_keys($data) : [];
        $this->validate($data, $onlyFields);

        try {
            $person = self::updateOrCreate(['id' => $id], $data);

            if (!empty($data['tags'])) {
                $this->setTags($person['id'], $data['tags']);
            }
        } catch (QueryException $e) {
            if (!isDuplicateException($e)) {
                $error = new Errors\ValidationException();
                $error->setPDOValidationException($e);
                throw $error;
            }

            $person = self::where('email', $data['email'])->first();
            $this->_setOtherTag($person);
        }

        return $person;
    }

    protected function _setOtherTag(Model $person): void
    {
        $defaultTags = array_values($this->_settings['defaultTags']);
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
        if (!$this->_searchField || !$this->_searchTerm) {
            return $builder;
        }

        $term = sprintf('%%%s%%', addcslashes($this->_searchTerm, '%_'));

        if ($this->_searchField === 'full_name') {
            $group = function (Builder $query) use ($term) {
                $query->orWhere('first_name', 'like', $term)
                    ->orWhere('last_name', 'like', $term);
            };
            return $builder->where($group);
        }

        return $builder->where($this->_searchField, 'like', $term);
    }
}
