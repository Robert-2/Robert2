<?php
declare(strict_types=1);

namespace Loxya\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Loxya\Contracts\Serializable;
use Loxya\Models\Traits\Serializer;
use Loxya\Models\Traits\TransientAttributes;
use Respect\Validation\Validator as V;

/**
 * Attribut de matériel personnalisé.
 *
 * @property-read ?int $id
 * @property string $name
 * @property string $type
 * @property string|null $unit
 * @property int|null $max_length
 * @property bool|null $is_totalisable
 * @property-read int|float|bool|string|null $value
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
 *
 * @property-read Collection<array-key, Category> $categories
 * @property-read Collection<array-key, Material> $materials
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

    public function checkType()
    {
        if ($this->exists && !$this->isDirty('type')) {
            return true;
        }

        return V::notEmpty()->anyOf(
            V::equals('string'),
            V::equals('integer'),
            V::equals('float'),
            V::equals('boolean'),
            V::equals('date'),
        );
    }

    public function checkUnit()
    {
        if (!in_array($this->type, ['integer', 'float'], true)) {
            return V::nullType();
        }
        return V::optional(V::length(1, 8));
    }

    public function checkMaxLength()
    {
        if ($this->type !== 'string') {
            return V::nullType();
        }
        return V::optional(V::numericVal());
    }

    public function checkIsTotalisable()
    {
        if (!in_array($this->type, ['integer', 'float'], true)) {
            return V::nullType();
        }
        return V::optional(V::boolType());
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function materials()
    {
        return $this->belongsToMany(Material::class, 'material_attributes')
            ->using(MaterialAttribute::class)
            ->withPivot('value')
            ->orderByPivot('id');
    }

    public function categories()
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
        'type' => 'string',
        'unit' => 'string',
        'max_length' => 'integer',
        'is_totalisable' => 'boolean',
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
    ];

    public function getCategoriesAttribute()
    {
        return $this->getRelationValue('categories');
    }

    public function getValueAttribute()
    {
        $value = $this->getTransientAttribute('value');
        if ($value === null) {
            return $value;
        }

        if ($this->type === 'integer') {
            return (int) $value;
        }

        if ($this->type === 'float') {
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
            case 'integer':
            case 'float':
                unset($data['max_length']);
                break;

            case 'string':
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

    // ------------------------------------------------------
    // -
    // -    Méthodes de "repository"
    // -
    // ------------------------------------------------------

    public static function staticEdit($id = null, array $data = []): static
    {
        $isCreate = $id === null;
        if (!$isCreate) {
            if (!static::staticExists($id)) {
                throw (new ModelNotFoundException())
                    ->setModel(self::class, $id);
            }

            // - À l'édition on ne permet pas le changement de type
            unset($data['type']);
        }

        return dbTransaction(static function () use ($id, $data) {
            $attribute = static::updateOrCreate(compact('id'), $data);

            if (isset($data['categories'])) {
                // Si on enlève toutes les catégories (= pas de limite par catégorie),
                // on veut conserver les valeurs existantes des caractéristiques du matériel,
                // donc on ne déclenche pas les events du model `AttributeCategory`.
                if (empty($data['categories'])) {
                    static::withoutEvents(static function () use ($attribute, $data) {
                        $attribute->categories()->sync($data['categories']);
                    });
                } else {
                    $attribute->categories()->sync($data['categories']);
                }
            }

            return $attribute->refresh();
        });
    }
}
