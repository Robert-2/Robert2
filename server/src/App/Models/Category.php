<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\QueryException;
use Robert2\API\Validation\Validator as V;
use Robert2\API\Errors\ValidationException;

class Category extends BaseModel
{
    protected $searchField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::callback([$this, 'checkName']),
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

        $query = static::where('name', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        if ($query->exists()) {
            return 'category-name-already-in-use';
        }

        return true;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = [
        'sub_categories'
    ];

    public function SubCategories()
    {
        return $this->hasMany(SubCategory::class)
            ->select(['id', 'name', 'category_id'])
            ->orderBy('name');
    }

    public function Materials()
    {
        return $this->hasMany(Material::class)->select([
            'id',
            'name',
            'description',
            'reference',
            'park_id',
            'rental_price',
            'stock_quantity',
            'out_of_order_quantity',
            'replacement_price',
        ]);
    }

    public function Attributes()
    {
        return $this->belongsToMany(Attribute::class, 'attribute_categories')
            ->using(AttributeCategoriesPivot::class)
            ->select(['attributes.id', 'attributes.name', 'attributes.type', 'attributes.unit']);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = ['name' => 'string'];

    public function getSubCategoriesAttribute()
    {
        return $this->SubCategories()->get()->toArray();
    }

    public function getMaterialsAttribute()
    {
        return $this->Materials()->get()->toArray();
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getIdsByNames(array $names): array
    {
        $categories = static::whereIn('name', $names)->get();
        $ids = [];
        foreach ($categories as $category) {
            $ids[] = $category->id;
        }
        return $ids;
    }

    public static function hasSubCategories(int $id): bool
    {
        $category = static::find($id);
        if (!$category) {
            return false;
        }
        return count($category['sub_categories']) > 0;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = ['name'];

    public function bulkAdd(array $categoriesNames = []): array
    {
        $categories = array_map(
            function ($categoryName) {
                $existingCategory = static::where('name', $categoryName)->first();
                if ($existingCategory) {
                    return $existingCategory;
                }

                $category = new static(['name' => trim($categoryName)]);
                return tap($category, function ($instance) {
                    $instance->validate();
                });
            },
            $categoriesNames
        );

        return dbTransaction(function () use ($categories) {
            try {
                foreach ($categories as $category) {
                    if (!$category->exists || $category->isDirty()) {
                        $category->save();
                    }
                }
            } catch (QueryException $e) {
                throw (new ValidationException)
                    ->setPDOValidationException($e);
            }

            return $categories;
        });
    }

    public function remove($id, array $options = []): ?BaseModel
    {
        $category = static::findOrFail($id);
        $category->delete();
        return null;
    }
}
