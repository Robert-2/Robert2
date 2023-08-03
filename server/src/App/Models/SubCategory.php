<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Illuminate\Database\Eloquent\Collection;
use Loxya\Contracts\Serializable;
use Loxya\Models\Traits\Serializer;
use Respect\Validation\Validator as V;

/**
 * Sous-catégorie de matériel.
 *
 * @property-read ?int $id
 * @property string $name
 * @property int $category_id
 * @property-read Category $category
 * @property-read Carbon $created_at
 * @property-read Carbon|null $updated_at
 *
 * @property-read Collection|Material[] $materials
 */
final class SubCategory extends BaseModel implements Serializable
{
    use Serializer;

    protected $searchField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::custom([$this, 'checkName']),
            'category_id' => V::custom([$this, 'checkCategoryId']),
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

    public function checkCategoryId($value)
    {
        V::notEmpty()->numericVal()->check($value);
        return Category::staticExists($value);
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

        return $this->hasMany(Material::class)
            ->select($fields)
            ->orderBy('id');
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
        'category_id',
    ];

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(): array
    {
        return (new DotArray($this->attributesForSerialization()))
            ->delete(['created_at', 'updated_at'])
            ->all();
    }
}
