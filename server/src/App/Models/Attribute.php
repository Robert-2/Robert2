<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Traits\Serializer;
use Robert2\API\Validation\Validator as V;

class Attribute extends BaseModel implements Serializable
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
            'type' => V::notEmpty()->oneOf(
                v::equals('string'),
                v::equals('integer'),
                v::equals('float'),
                v::equals('boolean'),
                v::equals('date')
            ),
            'unit' => V::callback([$this, 'checkUnit']),
            'max_length' => V::callback([$this, 'checkMaxLength']),
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
        return V::optional(V::numeric());
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function materials()
    {
        return $this->belongsToMany(Material::class, 'material_attributes')
            ->using(MaterialAttributesPivot::class)
            ->withPivot('value');
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
                    ->setModel(get_class(), $id);
            }

            // - À l'edition on ne permet pas les changements autre que le nom.
            //   (Vu qu'il peut y avoir déjà des valeurs un peu partout pour cet attribut)
            $data = array_with_keys($data, ['name']);
        }

        return dbTransaction(function () use ($id, $isCreate, $data) {
            $attribute = static::updateOrCreate(compact('id'), $data);

            if ($isCreate && isset($data['categories'])) {
                $attribute->categories()->sync($data['categories']);
            }

            return $attribute->refresh();
        });
    }

    public static function staticRemove($id, array $options = []): ?BaseModel
    {
        if (!static::findOrFail($id)->delete()) {
            throw new \RuntimeException(sprintf("Unable to delete the attribute #%d.", $id));
        }
        return null;
    }
}
