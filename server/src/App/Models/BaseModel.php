<?php
declare(strict_types=1);

namespace Loxya\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Respect\Validation\Exceptions\NestedValidationException;
use Loxya\Errors\Exception\ValidationException;

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
 * @method static \Illuminate\Database\Eloquent\Builder|static select($columns = ['*'])
 * @method static \Illuminate\Database\Eloquent\Builder|static selectRaw(string $expression, array $bindings = [])
 * @method static \Illuminate\Database\Eloquent\Builder|static orderBy($column, string $direction = 'asc')
 * @method static \Illuminate\Database\Eloquent\Builder|static where($column, $operator = null, $value = null, string $boolean = 'and')
 * @method static \Illuminate\Database\Eloquent\Builder|static whereNotIn(string $column, $values, string $boolean = 'and')
 * @method static \Illuminate\Database\Eloquent\Builder|static whereIn(string $column, $values, string $boolean = 'and', bool $not = false)
 *
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
 * @method static int count(string $columns = '*')
 *
 * @method static Builder|static search(string $term)
 * @method static Builder|static customOrderBy(string $column, 'asc'|'desc' $direction)
 */
abstract class BaseModel extends Model
{
    private $columns;

    protected $orderField;
    protected $orderDirection;

    protected $searchField;
    protected $searchTerm;

    protected $fillable;

    public $validation;

    protected const EXTRA_CHARS = "-_.' ÇçàÀâÂäÄåÅèÈéÉêÊëËíÍìÌîÎïÏòÒóÓôÔöÖðÐõÕøØúÚùÙûÛüÜýÝÿŸŷŶøØæÆœŒñÑßÞ";

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getAll(bool $withDeleted = false): Builder
    {
        $orderColumn = $this->orderField === null && empty($this->orders)
            ? (in_array('name', $this->getTableColumns(), true) ? 'name' : 'id')
            : $this->orderField;

        return static::query()
            ->when($withDeleted, fn (Builder $builder) => (
                $builder->onlyTrashed()
            ))
            ->when($this->searchTerm !== null, fn (Builder $builder) => (
                $builder->search($this->searchTerm)
            ))
            ->when($orderColumn !== null, fn (Builder $builder) => (
                $builder->customOrderBy($orderColumn, $this->orderDirection ?: 'asc')
            ));
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

    public function setSearch(?string $term = null): BaseModel
    {
        $term = $term !== null ? trim($term) : null;
        if ($term !== null && strlen($term) >= 2) {
            $this->searchTerm = $term;
        }
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
    // -    Query Scopes
    // -
    // ------------------------------------------------------

    /**
     * Permet de rechercher un terme donné, dans le ou les champ(s) spécifié(s)
     * dans le model (voir propriété `searchField` du model).
     *
     * @param Builder $query
     * @param string $term Le terme à rechercher (doit avoir au moins 2 caractères)
     */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        if (!property_exists($this, 'searchField')) {
            throw new \LogicException(sprintf(
                "Missing search field in model \"%s\".",
                static::class
            ));
        }

        $term = trim($term);
        if (strlen($term) < 2) {
            throw new \InvalidArgumentException("The term must contain more than two characters.");
        }

        $term = sprintf('%%%s%%', addcslashes($term, '%_'));
        return !is_array($this->searchField)
            ? $query->where($this->searchField, 'LIKE', $term)
            : $query->where(function (Builder $query) use ($term) {
                foreach ($this->searchField as $field) {
                    $query->orWhere($field, 'LIKE', $term);
                }
            });
    }

    public function scopeCustomOrderBy(Builder $query, string $column, string $direction = 'asc'): Builder
    {
        if (!in_array($column, $this->getTableColumns(), true)) {
            throw new \InvalidArgumentException("Invalid order field.");
        }
        return $query->orderBy($column, $direction);
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

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
