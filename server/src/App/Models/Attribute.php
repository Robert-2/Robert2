<?php
declare(strict_types=1);

namespace Loxya\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Loxya\Contracts\Serializable;
use Loxya\Models\Casts\AsSet;
use Loxya\Models\Enums\AttributeEntity;
use Loxya\Models\Enums\AttributeType;
use Loxya\Models\Traits\Serializer;
use Loxya\Models\Traits\TransientAttributes;
use Loxya\Support\Arr;
use Loxya\Support\Assert;
use Respect\Validation\Validator as V;

/**
 * Attribut de matériel personnalisé.
 *
 * @property-read ?int $id
 * @property string $name
 * @property array $entities
 * @property string $type
 * @property string|null $unit
 * @property int|null $max_length
 * @property bool|null $is_totalisable
 * @property int|float|bool|string|null $value
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
 *
 * @property-read Collection<array-key, Category> $categories
 * @property-read Collection<array-key, Material> $materials
 *
 * @method static Builder|static forEntity(AttributeEntity $entity)
 */
final class Attribute extends BaseModel implements Serializable
{
    use TransientAttributes;
    use Serializer {
        serialize as baseSerialize;
    }

    // - Types de sérialisation.
    public const SERIALIZE_DEFAULT = 'default';
    public const SERIALIZE_DETAILS = 'details';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::notEmpty()->alnum(static::EXTRA_CHARS)->length(2, 64),
            'entities' => V::custom([$this, 'checkEntities']),
            'type' => V::custom([$this, 'checkType']),
            'unit' => V::custom([$this, 'checkUnit']),
            'max_length' => V::custom([$this, 'checkMaxLength']),
            'is_totalisable' => V::custom([$this, 'checkIsTotalisable']),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkEntities($value)
    {
        if (!is_array($value)) {
            if (!V::notEmpty()->stringType()->validate($value)) {
                return false;
            }
            $value = explode(',', $value);
        }

        return V::arrayType()
            ->each(
                V::anyOf(
                    V::equals(AttributeEntity::MATERIAL->value),
                ),
            )
            ->validate($value);
    }

    public function checkType($value)
    {
        if ($this->exists && !$this->isDirty('type')) {
            return true;
        }

        return V::create()
            ->notEmpty()
            ->anyOf(
                V::equals(AttributeType::STRING->value),
                V::equals(AttributeType::TEXT->value),
                V::equals(AttributeType::INTEGER->value),
                V::equals(AttributeType::FLOAT->value),
                V::equals(AttributeType::BOOLEAN->value),
                V::equals(AttributeType::DATE->value),
            )
            ->validate($value);
    }

    public function checkUnit()
    {
        if (!in_array($this->type, [AttributeType::INTEGER->value, AttributeType::FLOAT->value], true)) {
            return V::nullType();
        }
        return V::nullable(V::length(1, 8));
    }

    public function checkMaxLength()
    {
        if (!in_array($this->type, [AttributeType::STRING->value, AttributeType::TEXT->value], true)) {
            return V::nullType();
        }
        return V::nullable(V::intVal());
    }

    public function checkIsTotalisable()
    {
        if (!in_array($this->type, [AttributeType::INTEGER->value, AttributeType::FLOAT->value], true)) {
            return V::nullType();
        }
        return V::nullable(V::boolType());
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function materials(): BelongsToMany
    {
        return $this->belongsToMany(Material::class, 'material_attributes')
            ->using(MaterialAttribute::class)
            ->withPivot('value')
            ->orderByPivot('id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'attribute_categories')
            ->using(AttributeCategory::class)
            ->orderBy('name');
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'name' => 'string',
        'entities' => AsSet::class,
        'type' => 'string',
        'unit' => 'string',
        'max_length' => 'integer',
        'is_totalisable' => 'boolean',
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
    ];

    /** @return Collection<array-key, Category> */
    public function getCategoriesAttribute(): Collection
    {
        return $this->getRelationValue('categories');
    }

    public function getValueAttribute(): mixed
    {
        $value = $this->getTransientAttribute('value');
        if ($value === null) {
            return $value;
        }

        if ($this->type === AttributeType::INTEGER->value) {
            return (int) $value;
        }

        if ($this->type === AttributeType::FLOAT->value) {
            return (float) $value;
        }

        if ($this->type === 'boolean') {
            return filter_var($value, \FILTER_VALIDATE_BOOL);
        }

        return $value;
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'name',
        'entities',
        'type',
        'unit',
        'max_length',
        'is_totalisable',
    ];

    public function setValueAttribute(string $value): void
    {
        $this->setTransientAttribute('value', $value);
    }

    // ------------------------------------------------------
    // -
    // -    Query Scopes
    // -
    // ------------------------------------------------------

    public function scopeForEntity(Builder $query, AttributeEntity $entity): Builder
    {
        Assert::isInstanceOf($entity, AttributeEntity::class);

        return $query->where(static fn ($query) => (
            $query->orWhereRaw("FIND_IN_SET(?, entities)", [$entity])
        ));
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes liées à une "entity"
    // -
    // ------------------------------------------------------

    public function edit(array $data): static
    {
        if ($this->exists) {
            // - À l'édition on ne permet pas le changement de type
            unset($data['type']);
        }

        return dbTransaction(function () use ($data) {
            $this->fill(Arr::except($data, ['categories']))->save();

            // - Catégories
            if (isset($data['categories'])) {
                Assert::isArray($data['categories'], "Key `categories` must be an array.");

                // Si on enlève toutes les catégories (= pas de limite par catégorie),
                // on veut conserver les valeurs existantes des caractéristiques du matériel,
                // donc on ne déclenche pas les events du model `AttributeCategory`.
                if (empty($data['categories'])) {
                    static::withoutEvents(function () use ($data) {
                        $this->categories()->sync($data['categories']);
                    });
                } else {
                    $this->categories()->sync($data['categories']);
                }
            }

            return $this->refresh();
        });
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(string $format = self::SERIALIZE_DEFAULT): array
    {
        /** @var Attribute $attribute */
        $attribute = tap(clone $this, static function (Attribute $attribute) use ($format) {
            if ($format === self::SERIALIZE_DETAILS) {
                $attribute->append(['categories']);
            }
        });

        $data = $attribute->attributesForSerialization();

        switch ($data['type']) {
            case AttributeType::INTEGER->value:
            case AttributeType::FLOAT->value:
                unset($data['max_length']);
                break;

            case AttributeType::STRING->value:
                unset($data['unit'], $data['is_totalisable']);
                break;

            default:
                unset(
                    $data['unit'],
                    $data['max_length'],
                    $data['is_totalisable'],
                );
        }

        unset(
            $data['created_at'],
            $data['updated_at'],
        );

        return $data;
    }
}
