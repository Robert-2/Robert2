<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\Support\Arr;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Traits\Serializer;
use Respect\Validation\Validator as V;

/**
 * Attribut de matériel personnalisé.
 *
 * @property-read ?int $id
 * @property string $name
 * @property string $type
 * @property string|null $unit
 * @property int|null $max_length
 * @property-read Carbon $created_at
 * @property-read ?Carbon $updated_at
 * @property-read ?Carbon $deleted_at
 *
 * @property-read Collection|Category[] $categories
 * @property-read Collection|Material[] $materials
 */
final class Attribute extends BaseModel implements Serializable
{
    use Serializer {
        serialize as baseSerialize;
    }

    protected $orderField = 'id';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::notEmpty()->alnum(static::EXTRA_CHARS)->length(2, 64),
            'type' => V::notEmpty()->anyOf(
                V::equals('string'),
                V::equals('integer'),
                V::equals('float'),
                V::equals('boolean'),
                V::equals('date')
            ),
            'unit' => V::custom([$this, 'checkUnit']),
            'max_length' => V::custom([$this, 'checkMaxLength']),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

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
    ];

    public function getCategoriesAttribute()
    {
        return $this->getRelationValue('categories');
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    protected static $serializedNames = [
        'max_length' => 'maxLength',
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
                unset($data['unit']);
                break;

            default:
                unset($data['maxLength'], $data['unit']);
        }

        unset(
            $data['created_at'],
            $data['updated_at'],
            $data['deleted_at'],
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
    ];

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
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

            // - À l'edition on ne permet pas les changements autre que le nom.
            //   (Vu qu'il peut y avoir déjà des valeurs un peu partout pour cet attribut)
            $data = Arr::only($data, ['name']);
        }

        return dbTransaction(function () use ($id, $isCreate, $data) {
            $attribute = static::updateOrCreate(compact('id'), $data);

            if ($isCreate && isset($data['categories'])) {
                $attribute->categories()->sync($data['categories']);
            }

            return $attribute->refresh();
        });
    }
}
