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
    private $columns;

    protected $orderField;
    protected $orderDirection;

    protected $allowedSearchFields = [];
    protected $searchField;
    protected $searchTerm;

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

        if (!empty($this->searchTerm)) {
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

        if (!empty($this->searchTerm)) {
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
            $this->orderField = $orderBy;
        }
        $this->orderDirection = $ascending ? 'asc' : 'desc';
        return $this;
    }

    public function setSearch(?string $term = null, $fields = null): BaseModel
    {
        if (empty($term)) {
            return $this;
        }

        if ($fields) {
            $fields = !is_array($fields) ? explode('|', $fields) : $fields;
            foreach ($fields as $field) {
                if (!in_array($field, $this->getAllowedSearchFields())) {
                    throw new InvalidArgumentException("Search field « $field » not allowed.");
                }
                $this->searchField = $field;
            }
        }

        $this->searchTerm = trim($term);
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
            throw new Errors\NotFoundException(sprintf("Edit failed, record %d not found.", $id));
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
                throw new \RuntimeException(sprintf("Unable to destroy the record %d.", $id));
            }
            return null;
        }

        if (!$model->delete()) {
            throw new \RuntimeException(sprintf("Unable to delete the record %d.", $id));
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
            throw new \RuntimeException(sprintf("Unable to restore the record %d.", $id));
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
            throw new \RuntimeException("Validation rules cannot be empty.");
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

    public function getTableColumns(): array
    {
        if (!$this->columns) {
            $this->columns = $this->getConnection()
                ->getSchemaBuilder()
                ->getColumnListing($this->getTable());
        }
        return $this->columns;
    }

    public function getAllowedSearchFields(): array
    {
        return array_unique(array_merge(
            (array)$this->searchField,
            (array)$this->allowedSearchFields
        ));
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _getOrderBy(?Builder $builder = null): Builder
    {
        $direction = $this->orderDirection ?: 'asc';

        $order = $this->orderField;
        if (!$order) {
            $order = in_array('name', $this->getTableColumns()) ? 'name' : 'id';
        }

        if ($builder) {
            return $builder->orderBy($order, $direction);
        }

        return self::orderBy($order, $direction);
    }

    protected function _setSearchConditions(Builder $builder): Builder
    {
        if (!$this->searchField || !$this->searchTerm) {
            return $builder;
        }

        $term = sprintf('%%%s%%', addcslashes($this->searchTerm, '%_'));

        if (is_array($this->searchField)) {
            $group = function (Builder $query) use ($term) {
                foreach ($this->searchField as $field) {
                    $query->orWhere($field, 'LIKE', $term);
                }
            };
            return $builder->where($group);
        }

        return $builder->where($this->searchField, 'LIKE', $term);
    }
}
