<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Database\Eloquent\Builder;
use Respect\Validation\Exceptions\NestedValidationException;
use InvalidArgumentException;
use Robert2\API\Config\Config;
use Robert2\API\Errors;

class BaseModel extends Model
{
    protected $table;
    protected $_settings;

    protected $_modelName;
    protected $_orderField;
    protected $_orderDirection;

    protected $_allowedSearchFields;
    protected $_searchField;
    protected $_searchTerm;

    protected $fillable;

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public $validation;

    const EXTRA_CHARS = '-_. ÇçàÀâÂäÄåÅèÈéÉêÊëËíÍìÌîÎïÏòÒóÓôÔöÖðÐõÕøØúÚùÙûÛüÜýÝÿŸŷŶøØæÆœŒñÑßÞ';

    public function __construct(array $attributes = [])
    {
        $this->_settings  = Config::getSettings();

        Config::getCapsule();

        parent::__construct($attributes);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(bool $withDeleted = false): Builder
    {
        $builder = $this->_getOrderBy();

        if (!empty($this->_searchTerm)) {
            $builder = $this->_setSearchConditions($builder);
        }

        if ($withDeleted) {
            $builder = $builder->onlyTrashed();
        }

        return $builder;
    }

    public function getAllFiltered(array $conditions, bool $withDeleted = false): Builder
    {
        $builder = self::where($conditions);

        if (!empty($this->_searchTerm)) {
            $builder = $this->_setSearchConditions($builder);
        }

        if ($withDeleted) {
            $builder = $builder->onlyTrashed();
        }

        return $this->_getOrderBy($builder);
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    public function setOrderBy(?string $orderBy = null, bool $ascending = true): BaseModel
    {
        if ($orderBy) {
            $this->_orderField = $orderBy;
        }
        $this->_orderDirection = $ascending ? 'asc' : 'desc';
        return $this;
    }

    public function setSearch(?string $term = null, ?string $field = null): BaseModel
    {
        if (empty($term)) {
            return $this;
        }

        if ($field) {
            if (!in_array($field, $this->_allowedSearchFields)) {
                throw new InvalidArgumentException("Search field « $field » not allowed.");
            }

            $this->_searchField = $field;
        }

        $this->_searchTerm = trim($term);
        return $this;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    "Repository" methods
    // —
    // ——————————————————————————————————————————————————————

    public function edit(?int $id = null, array $data = []): Model
    {
        if ($id && !$this->exists($id)) {
            throw new Errors\NotFoundException("Edit model $this->_modelName failed, entity not found.");
        }

        $data = cleanEmptyFields($data);
        try {
            $model = self::firstOrNew(compact('id'));
            $model->fill($data)->validate()->save();
        } catch (QueryException $e) {
            $error = new Errors\ValidationException();
            $error->setPDOValidationException($e);
            throw $error;
        }

        return $model;
    }

    public function remove(int $id, array $options = []): ?Model
    {
        $options = array_merge([
            'force' => false
        ], $options);

        $model = self::withTrashed()->find($id);
        if (empty($model)) {
            throw new Errors\NotFoundException;
        }

        if ($model->trashed() || $options['force'] === true) {
            if (!$model->forceDelete()) {
                throw new \RuntimeException("Unable to destroy $this->_modelName ID #$id.");
            }
            return null;
        }

        if (!$model->delete()) {
            throw new \RuntimeException("Unable to delete $this->_modelName ID #$id.");
        }

        return $model;
    }

    public function unremove(int $id): Model
    {
        $model = self::onlyTrashed()->find($id);
        if (empty($model)) {
            throw new Errors\NotFoundException;
        }

        if (!$model->restore()) {
            throw new \RuntimeException("Unable to restore $this->_modelName ID #$id.");
        }

        return $model;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Other useful methods
    // —
    // ——————————————————————————————————————————————————————

    public function exists(int $id): bool
    {
        return self::where('id', $id)->exists();
    }

    public function validate(): self
    {
        $rules = $this->validation;
        if (empty($rules)) {
            throw new \RuntimeException("Validation rules cannot be empty for model $this->_modelName.");
        }

        $data = $this->getAttributes();
        foreach ($data as $field => $value) {
            if (is_array($value)) {
                unset($data[$field]);
            }
        }

        // - Si le modèle existe déjà en base, on ne valide que les champs qui ont changés.
        if ($this->exists) {
            $rules = array_intersect_key($rules, $this->getDirty());
        }

        // - Validation
        $errors = [];
        foreach ($rules as $field => $rule) {
            try {
                $rule->setName($field)->assert($data[$field] ?? null);
            } catch (NestedValidationException $e) {
                $errors[$field] = $e->getMessages();
            }
        }

        if (count($errors) > 0) {
            $ex = new Errors\ValidationException();
            $ex->setValidationErrors($errors);
            throw $ex;
        }

        return $this;
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _getOrderBy(?Builder $builder = null): Builder
    {
        $order = $this->_orderField ?: 'id';
        $direction = $this->_orderDirection ?: 'asc';

        if ($builder) {
            return $builder->orderBy($order, $direction);
        }

        return self::orderBy($order, $direction);
    }

    protected function _setSearchConditions(Builder $builder): Builder
    {
        if (!$this->_searchField || !$this->_searchTerm) {
            return $builder;
        }

        $term = sprintf('%%%s%%', addcslashes($this->_searchTerm, '%_'));

        if (preg_match('/\|/', $this->_searchField)) {
            $fields = explode('|', $this->_searchField);

            $group = function (Builder $query) use ($fields, $term) {
                foreach ($fields as $field) {
                    $query->orWhere($field, 'LIKE', $term);
                }
            };

            return $builder->where($group);
        }

        return $builder->where($this->_searchField, 'LIKE', $term);
    }
}
