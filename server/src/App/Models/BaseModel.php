<?php
declare(strict_types=1);

namespace Loxya\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MissingAttributeException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Support\Arr;
use Respect\Validation\Exceptions\NestedValidationException;

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
 * @method static Builder|static query()
 * @method static Builder|static select($columns = ['*'])
 * @method static Builder|static selectRaw(string $expression, array $bindings = [])
 * @method static Builder|static orderBy($column, string $direction = 'asc')
 * @method static Builder|static where($column, $operator = null, $value = null, string $boolean = 'and')
 * @method static Builder|static whereNotIn(string $column, $values, string $boolean = 'and')
 * @method static Builder|static whereIn(string $column, $values, string $boolean = 'and', bool $not = false)
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
 * @method static \Illuminate\Database\Eloquent\Collection|static[] get($columns = ['*'])
 * @method static static|null find($id, $columns = ['*'])
 * @method static static|null first($columns = ['*'])
 * @method static int count(string $columns = '*')
 *
 * @method static Builder|static customOrderBy(string $column, ?string $direction = 'asc')
 */
abstract class BaseModel extends Model
{
    private $columns;

    protected $validation;

    protected const EXTRA_CHARS = "-_.' ÇçàÀâÂäÄåÅèÈéÉêÊëËíÍìÌîÎïÏòÒóÓôÔöÖðÐõÕøØúÚùÙûÛüÜýÝÿŸŷŶøØæÆœŒñÑßÞ";

    // ------------------------------------------------------
    // -
    // -    Méthodes de "repository"
    // -
    // ------------------------------------------------------

    public static function new(array $data = []): static
    {
        return static::staticEdit(null, $data);
    }

    public static function staticExists($id): bool
    {
        return static::where('id', $id)->exists();
    }

    public static function staticEdit($id = null, array $data = []): static
    {
        if ($id && !static::staticExists($id)) {
            throw (new ModelNotFoundException())
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
        $data = array_map(
            static function ($value) {
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

    public function __isset($key)
    {
        // NOTE: En temps normal, `isset($model)` retourne `true` uniquement si
        //       l'attribut existe et qu'il est non `null`. De notre côté on on
        //       considère que même s'il est `null`, l'attribut existe bien au
        //       niveau du modèle (ceci pour améliorer la prise en charge dans
        //       Twig, sans quoi il tente de passer par une méthode avec le même
        //       nom que l'attribut et se retrouve à retourner des relations).
        try {
            $this->getAttribute($key);
            return true;
        } catch (MissingAttributeException) {
            return false;
        }
    }

    // ------------------------------------------------------
    // -
    // -    Other useful methods
    // -
    // ------------------------------------------------------

    public function getOrderableColumns(): array
    {
        if (property_exists($this, 'orderable')) {
            return $this->orderable;
        }

        $orderable = [$this->getKey()];
        if (in_array('name', $this->getTableColumns(), true)) {
            array_unshift($orderable, 'name');
        }

        return $orderable;
    }

    public function getDefaultOrderColumn(): string|null
    {
        return Arr::first($this->getOrderableColumns());
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

    public function getAttributeUnsafeValue($key)
    {
        return $this->isDirty($key)
            ? $this->getAttributeFromArray($key)
            : $this->getAttributeValue($key);
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
            array_keys($this->getDirty()),
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
