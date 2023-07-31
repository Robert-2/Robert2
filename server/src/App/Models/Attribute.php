<?php
declare(strict_types=1);

namespace Loxya\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Loxya\Contracts\Serializable;
use Loxya\Models\Traits\Serializer;
use Respect\Validation\Validator as V;
use Loxya\Models\Traits\TransientAttributes;

/**
 * Attribut de matériel personnalisé.
 *
 * @property-read ?int $id
 * @property string $name
 * @property string $type
 * @property string|null $unit
 * @property int|null $max_length
 * @property-read int|float|bool|string|null $value
 * @property-read Carbon $created_at
 * @property-read ?Carbon $updated_at
 *
 * @property-read Collection|Category[] $categories
 * @property-read Collection|Material[] $materials
 */
final class Attribute extends BaseModel implements Serializable
{
    use TransientAttributes;
    use Serializer {
        serialize as baseSerialize;
    }

    protected $orderField = 'id';

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
            V::equals('date')
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
            return $value === 'true' || $value === '1';
        }

        return $value;
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    protected static $serializedNames = [
        'max_length' => 'maxLength',
        'is_totalisable' => 'isTotalisable',
    ];

    public function serialize(): array
    {
        $data = $this->baseSerialize();

        switch ($data['type']) {
            case 'integer':
            case 'float':
                unset($data['maxLength']);
                break;

            case 'string':
                unset($data['unit'], $data['isTotalisable']);
                break;

            default:
                unset($data['unit'], $data['isTotalisable'], $data['maxLength']);
        }

        unset(
            $data['created_at'],
            $data['updated_at'],
        );

        return $data;
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

    public function setValueAttribute(string $value)
    {
        $this->setTransientAttribute('value', $value);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes de "repository"
    // -
    // ------------------------------------------------------

    public static function staticEdit($id = null, array $data = []): BaseModel
    {
        $isCreate = $id === null;
        if (!$isCreate) {
            if (!static::staticExists($id)) {
                throw (new ModelNotFoundException)
                    ->setModel(self::class, $id);
            }

            // - À l'édition on ne permet pas le changement de type
            unset($data['type']);
        }

        return dbTransaction(function () use ($id, $data) {
            $attribute = static::updateOrCreate(compact('id'), $data);

            if (isset($data['categories'])) {
                // Si on enlève toutes les catégories (= pas de limite par catégorie),
                // on veut conserver les valeurs existantes des caractéristiques du matériel,
                // donc on ne déclenche pas les events du model `AttributeCategory`.
                if (empty($data['categories'])) {
                    static::withoutEvents(function () use ($attribute, $data) {
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
