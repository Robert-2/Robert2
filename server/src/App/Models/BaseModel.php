<?php
declare(strict_types=1);

namespace Loxya\Models;

use Brick\Math\BigDecimal as Decimal;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MissingAttributeException;
use Illuminate\Database\Eloquent\Model;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Support\Arr;
use Respect\Validation\Exceptions\AllOfException;
use Respect\Validation\Exceptions\AnyOfException;
use Respect\Validation\Exceptions\NestedValidationException;
use Respect\Validation\Exceptions\NotEmptyException;
use Respect\Validation\Exceptions\OneOfException;

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
 * @method static Builder|static whereBelongsTo(\Illuminate\Database\Eloquent\Model|\Illuminate\Database\Eloquent\Collection<\Illuminate\Database\Eloquent\Model> $related, string|null $relationshipName = null, string $boolean = 'and')
 * @method static Builder|static orWhereBelongsTo(\Illuminate\Database\Eloquent\Model|\Illuminate\Database\Eloquent\Collection<\Illuminate\Database\Eloquent\Model> $related, string|null $relationshipName = null)
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
 * @method static \Illuminate\Support\Collection|static[] pluck(string|\Illuminate\Contracts\Database\Query\Expression $column, string|null $key = null)
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
    // -    Méthodes liées à une "entity"
    // -
    // ------------------------------------------------------

    public function edit(array $data): static
    {
        $this->fill($data)->save();

        return $this->refresh();
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes de "repository"
    // -
    // ------------------------------------------------------

    public static function new(array $data): static
    {
        // @phpstan-ignore-next-line
        return (new static())->edit($data);
    }

    public static function includes($id): bool
    {
        return static::where('id', $id)->exists();
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

    public function syncChanges()
    {
        $this->changes = [];
        foreach (array_keys($this->getAttributes()) as $key) {
            if (!$this->originalIsEquivalent($key)) {
                $this->changes[$key] = $this->getRawOriginal($key);
            }
        }

        return $this;
    }

    public function getPrevious($key = null, $default = null)
    {
        $previousAttributes = array_replace($this->original, $this->changes);

        // @phpstan-ignore new.static (même implémentation que `static::getOriginal()`)
        return (new static())
            ->setRawAttributes($previousAttributes, true)
            ->getOriginalWithoutRewindingModel($key, $default);
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

    public function toArray()
    {
        return $this->attributesToArray();
    }

    protected function mutateAttributeForArray($key, $value)
    {
        $value = parent::mutateAttributeForArray($key, $value);

        $serialize = static function ($value) use (&$serialize) {
            if ($value instanceof Decimal) {
                return (string) $value;
            }

            if (is_array($value)) {
                return array_map(
                    static fn ($subValue) => $serialize($subValue),
                    $value,
                );
            }

            return $value;
        };

        return $serialize($value);
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

        $getFormattedErrorMessage = static function (NestedValidationException $exception) {
            $messages = $exception->getMessages();
            if (count($messages) === 1) {
                return current($messages);
            }

            $rootException = iterator_to_array($exception)[0] ?? null;
            if ($rootException !== null) {
                switch (get_class($rootException)) {
                    case NotEmptyException::class:
                        return current($messages);

                    case OneOfException::class:
                    case AnyOfException::class:
                        return implode("\n", [
                            array_shift($messages),
                            ...array_map(
                                static fn ($message) => sprintf('- %s', $message),
                                $messages,
                            ),
                        ]);

                    case AllOfException::class:
                        $messages = array_slice($messages, 1);
                        break;
                }
            }

            return implode("\n", array_map(
                static fn ($message) => sprintf('- %s', $message),
                $messages,
            ));
        };

        // - Validation
        $errors = [];
        foreach ($rules as $field => $rule) {
            try {
                $rule->setName($field)->assert($data[$field] ?? null);
            } catch (NestedValidationException $e) {
                $errors[$field] = $getFormattedErrorMessage($e);
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
