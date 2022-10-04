<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Contracts\Serializable;
use Robert2\API\Validation\Validator as V;
use Robert2\API\Models\Traits\Serializer;

class Category extends BaseModel implements Serializable
{
    use Serializer;

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

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function subCategories()
    {
        return $this->hasMany(SubCategory::class)
            ->orderBy('name');
    }

    public function materials()
    {
        return $this->hasMany(Material::class);
    }

    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'attribute_categories')
            ->using(AttributeCategoriesPivot::class)
            ->select([
                'attributes.id',
                'attributes.name',
                'attributes.type',
                'attributes.unit',
            ]);
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'name' => 'string',
    ];

    public function getSubCategoriesAttribute()
    {
        return $this->subCategories()->get();
    }

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public static function hasSubCategories(int $id): bool
    {
        $category = static::find($id);
        if (!$category) {
            return false;
        }
        return $category->sub_categories->isNotEmpty();
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = ['name'];

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
    // -
    // ------------------------------------------------------

    public static function bulkAdd(array $categoriesNames = []): array
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
            foreach ($categories as $category) {
                if (!$category->exists || $category->isDirty()) {
                    $category->save();
                    $category->refresh();
                }
            }
            return $categories;
        });
    }

    public static function staticRemove($id, array $options = []): ?BaseModel
    {
        if (!static::findOrFail($id)->delete()) {
            throw new \RuntimeException(sprintf("Unable to delete the category #%d.", $id));
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
