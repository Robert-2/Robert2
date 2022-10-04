<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Traits\Serializer;
use Robert2\API\Validation\Validator as V;

class SubCategory extends BaseModel implements Serializable
{
    use Serializer;

    protected $searchField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::callback([$this, 'checkName']),
            'category_id' => V::notEmpty()->numeric(),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkName($value)
    {
        V::notEmpty()
            ->length(2, 96)
            ->check($value);

        if (empty($this->category_id)) {
            return true;
        }

        $query = static::newQuery()
            ->where('name', $value)
            ->where('category_id', $this->category_id);

        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        if ($query->exists()) {
            return 'subcategory-already-in-use-for-this-category';
        }

        return true;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function materials()
    {
        $fields = [
            'id',
            'name',
            'description',
            'reference',
            'park_id',
            'rental_price',
            'stock_quantity',
            'out_of_order_quantity',
            'replacement_price',
        ];

        return $this->hasMany(Material::class)->select($fields);
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'name' => 'string',
        'category_id' => 'integer',
    ];

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'name',
        'category_id'
    ];

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
    // -
    // ------------------------------------------------------

    public static function staticRemove($id, array $options = []): ?BaseModel
    {
        if (!static::findOrFail($id)->delete()) {
            throw new \RuntimeException(sprintf("Unable to delete the sub-category #%d.", $id));
        }
        return null;
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(): array
    {
        $data = $this->attributesForSerialization();

        unset(
            $data['created_at'],
            $data['updated_at'],
        );

        return $data;
    }
}
