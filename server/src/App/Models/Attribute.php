<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Robert2\API\Validation\Validator as V;

class Attribute extends BaseModel
{
    protected $orderField = 'id';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::notEmpty()->alnum(self::EXTRA_CHARS)->length(2, 64),
            'type' => V::notEmpty()->oneOf(
                v::equals('string'),
                v::equals('integer'),
                v::equals('float'),
                v::equals('boolean'),
                v::equals('date')
            ),
            'unit' => V::optional(V::length(1, 8)),
            'max_length' => V::optional(V::numeric()),
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function Materials()
    {
        return $this->belongsToMany('Robert2\API\Models\Material', 'material_attributes')
            ->using('Robert2\API\Models\MaterialAttributesPivot')
            ->withPivot('value')
            ->select(['materials.id', 'name']);
    }

    public function Categories()
    {
        return $this->belongsToMany('Robert2\API\Models\Category', 'attribute_categories')
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
        return $this->Categories()->get()->toArray();
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(bool $withDeleted = false): Builder
    {
        $builder = parent::getAll($withDeleted);
        return $builder->with('categories');
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

    public function edit(?int $id = null, array $data = []): Model
    {
        if ($id) {
            $data = ['name' => $data['name']];
        }

        return parent::edit($id, $data);
    }

    public function remove(int $id, array $options = []): ?Model
    {
        $model = self::find($id);
        if (empty($model)) {
            throw new Errors\NotFoundException;
        }

        if (!$model->delete()) {
            throw new \RuntimeException(sprintf("Unable to delete the attribute %d.", $id));
        }

        return null;
    }
}
