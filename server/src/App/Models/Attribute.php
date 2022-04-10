<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Validation\Validator as V;
use Robert2\API\Models\Traits\Serializer;

class Attribute extends BaseModel
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

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function Materials()
    {
        return $this->belongsToMany(Material::class, 'material_attributes')
            ->using(MaterialAttributesPivot::class)
            ->withPivot('value')
            ->select(['materials.id', 'name']);
    }

    public function Categories()
    {
        return $this->belongsToMany(Category::class, 'attribute_categories')
            ->orderBy('name')
            ->select(['categories.id', 'name']);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'name' => 'string',
        'type' => 'string',
        'unit' => 'string',
        'max_length' => 'integer',
    ];

    public function getMaterialsAttribute()
    {
        $materials = $this->Materials()->get();
        return $materials ? $materials->toArray() : null;
    }

    public function getCategoriesAttribute()
    {
        return $this->Categories()->get();
    }

    // ------------------------------------------------------
    // -
    // -    Serialize
    // -
    // ------------------------------------------------------

    protected $serializedNames = [
        'max_length' => 'maxLength',
    ];

    protected function serialize(): array
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

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'name',
        'type',
        'unit',
        'max_length',
    ];

    // ——————————————————————————————————————————————————————
    // —
    // —    "Repository" methods
    // —
    // ——————————————————————————————————————————————————————

    public function remove($id, array $options = []): ?BaseModel
    {
        $attribute = static::findOrFail($id);
        if (!$attribute->delete()) {
            throw new \RuntimeException(sprintf("Unable to delete the attribute %d.", $id));
        }
        return null;
    }
}
