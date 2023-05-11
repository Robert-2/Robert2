<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Respect\Validation\Exceptions\NestedValidationException;
use Robert2\API\Errors\Exception\ValidationException;

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

    protected const EXTRA_CHARS = "-_.' ÇçàÀâÂäÄåÅèÈéÉêÊëËíÍìÌîÎïÏòÒóÓôÔöÖðÐõÕøØúÚùÙûÛüÜýÝÿŸŷŶøØæÆœŒñÑßÞ";

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
                if (!in_array($field, $this->getAllowedSearchFields(), true)) {
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

    // ------------------------------------------------------
    // -
    // -    Méthodes de "repository"
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
                ->setModel(self::class, $id);
        }

        $model = static::updateOrCreate(compact('id'), $data);
        return $model->refresh();
    }

    public static function staticDelete($id): bool|null
    {
        return static::find($id)?->delete();
    }

    // ------------------------------------------------------
    // -
    // -    Overwritten methods
    // -
    // ------------------------------------------------------

    public function fill(array $attributes)
    {
        // TODO: Devrait être fait dans les setters des modèles ...
        $data = array_map(
            function ($value) {
                $value = is_string($value) ? trim($value) : $value;
                return $value === '' ? null : $value;
            },
            $attributes,
        );

        return parent::fill($data);
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
            (array) $this->searchField,
            (array) $this->allowedSearchFields
        ));
    }

    // ------------------------------------------------------
    // -
    // -    Validation related
    // -
    // ------------------------------------------------------

    public function validationErrors(): array
    {
        /** @var array<string, \Respect\Validation\Rules\AbstractRule> $rules */
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
                $errors[$field] = array_values($e->getMessages());
            }
        }

        return $errors;
    }

    public function isValid(): bool
    {
        return count($this->validationErrors()) === 0;
    }

    public function validate(): static
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
            $order = in_array('name', $this->getTableColumns(), true) ? 'name' : 'id';
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

    public function jsonSerialize(): mixed
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
