<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Respect\Validation\Exceptions\NestedValidationException;
use Robert2\API\Errors\ValidationException;

/**
 * @mixin \Illuminate\Database\Eloquent\Builder
 *
 * @method null|static first($columns = ['*'])
 * @method static firstOrNew(array $attributes = [], array $values = [])
 * @method static firstOrFail($columns = ['*'])
 * @method static firstOrCreate(array $attributes, array $values = [])
 * @method static firstOr($columns = ['*'], \Closure $callback = null)
 * @method static firstWhere($column, $operator = null, $value = null, $boolean = 'and')
 * @method static updateOrCreate(array $attributes, array $values = [])
 *
 * @method static \Illuminate\Database\Eloquent\Builder|static query()
 * @method static static make(array $attributes = [])
 * @method static static create(array $attributes = [])
 * @method static static forceCreate(array $attributes)
 * @method static static findOrFail($id, $columns = ['*'])
 * @method static static findOrNew($id, $columns = ['*'])
 * @method static static firstOrNew(array $attributes = [], array $values = [])
 * @method static static firstOrFail($columns = ['*'])
 * @method static static firstOrCreate(array $attributes, array $values = [])
 * @method static static firstOr($columns = ['*'], \Closure $callback = null)
 * @method static static firstWhere($column, $operator = null, $value = null, $boolean = 'and')
 * @method static static updateOrCreate(array $attributes, array $values = [])
 * @method static null|static find($id, $columns = ['*'])
 * @method static null|static first($columns = ['*'])
 */
abstract class BaseModel extends Model
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

    const EXTRA_CHARS = "-_.' ÇçàÀâÂäÄåÅèÈéÉêÊëËíÍìÌîÎïÏòÒóÓôÔöÖðÐõÕøØúÚùÙûÛüÜýÝÿŸŷŶøØæÆœŒñÑßÞ";

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getAll(bool $withDeleted = false): Builder
    {
        $builder = static::query();

        if (!empty($this->searchTerm)) {
            $builder = $this->_setSearchConditions($builder);
        }

        if ($withDeleted) {
            $builder = $builder->onlyTrashed();
        }

        return $this->_getOrderBy($builder);
    }

    public function getAllFiltered(array $conditions, bool $withDeleted = false): Builder
    {
        $builder = $this->getAll($withDeleted);
        return $builder->where($conditions);
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
                    throw new \InvalidArgumentException(
                        sprintf("Search field \"%s\" not allowed.", $field)
                    );
                }
                $this->searchField = $field;
            }
        }

        $this->searchTerm = trim($term);
        return $this;
    }

    public function addSearch(string $term, ?array $fields = null): Builder
    {
        if (!$term) {
            throw new \InvalidArgumentException();
        }

        $trimmedTerm = trim($term);
        if (strlen($trimmedTerm) < 2) {
            throw new \InvalidArgumentException();
        }

        $safeTerm = sprintf('%%%s%%', addcslashes($trimmedTerm, '%_'));

        if (empty($fields)) {
            return $this->where($this->searchField, 'LIKE', $safeTerm);
        }

        $query = $this;
        foreach ($fields as $field) {
            $query = $query->orWhere($field, 'LIKE', $safeTerm);
        }

        return $query;
    }

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
    // -
    // ------------------------------------------------------

    public static function new(array $data = []): BaseModel
    {
        return static::staticEdit(null, $data);
    }

    public static function staticExists($id): bool
    {
        return static::where('id', $id)->exists();
    }

    public static function staticEdit($id = null, array $data = []): BaseModel
    {
        if ($id && !static::staticExists($id)) {
            throw (new ModelNotFoundException)
                ->setModel(get_class(), $id);
        }

        $model = static::updateOrCreate(compact('id'), $data);
        return $model->refresh();
    }

    public static function staticRemove($id, array $options = []): ?BaseModel
    {
        $options = array_merge(['force' => false], $options);

        $entity = static::withTrashed()->findOrFail($id);
        if ($entity->trashed() || $options['force'] === true) {
            if (!$entity->forceDelete()) {
                throw new \RuntimeException(sprintf("Unable to destroy the record %d.", $id));
            }
            return null;
        }

        if (!$entity->delete()) {
            throw new \RuntimeException(sprintf("Unable to delete the record %d.", $id));
        }

        return $entity;
    }

    public static function staticUnremove($id): BaseModel
    {
        $entity = static::onlyTrashed()->findOrFail($id);
        if (!$entity->restore()) {
            throw new \RuntimeException(sprintf("Unable to restore the record %d.", $id));
        }
        return $entity;
    }

    // ------------------------------------------------------
    // -
    // -    Overwritten methods
    // -
    // ------------------------------------------------------

    public function fill(array $attributes)
    {
        $data = array_map(
            fn($value) => $value === '' ? null : $value,
            $attributes,
        );

        $trimmedData = [];
        foreach ($data as $field => $value) {
            $isString = array_key_exists($field, $this->casts) && $this->casts[$field] === 'string';
            $trimmedData[$field] = $isString && $value ? trim($value) : $value;
        }

        return parent::fill($trimmedData);
    }

    public function save(array $options = [])
    {
        if ($options['validate'] ?? true) {
            $this->validate();
        }

        unset($options['validate']);
        return parent::save($options);
    }

    // ------------------------------------------------------
    // -
    // -    Other useful methods
    // -
    // ------------------------------------------------------

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
    // -    Validation related
    // -
    // ------------------------------------------------------

    public function validationErrors(): array
    {
        $rules = $this->validation;
        if (empty($rules)) {
            throw new \RuntimeException("Validation rules cannot be empty.");
        }

        // - Récupère les attributs du modèle, castés (sauf les données tout juste ajoutées).
        $data = $this->addCastAttributesToArray(
            $this->getAttributes(),
            array_keys($this->getDirty())
        );

        foreach ($data as $field => $value) {
            if (is_array($value)) {
                unset($data[$field]);
            }
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

        return $errors;
    }

    public function isValid(): bool
    {
        return count($this->validationErrors()) === 0;
    }

    public function validate(): self
    {
        $errors = $this->validationErrors();
        if (count($errors) > 0) {
            throw new ValidationException($errors);
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
        $direction = $this->orderDirection ?: 'asc';

        $order = $this->orderField;
        if (!$order) {
            $order = in_array('name', $this->getTableColumns()) ? 'name' : 'id';
        }

        if ($builder) {
            return $builder->orderBy($order, $direction);
        }

        return static::orderBy($order, $direction);
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

    public function jsonSerialize()
    {
        if (method_exists($this, 'serialize')) {
            return $this->serialize();
        }
        return parent::jsonSerialize();
    }

    // @see https://laravel.com/docs/8.x/eloquent-serialization#customizing-the-default-date-format
    protected function serializeDate(\DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }
}
