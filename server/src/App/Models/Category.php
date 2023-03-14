<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Collection;
use Robert2\API\Contracts\Serializable;
use Respect\Validation\Validator as V;
use Robert2\API\Models\Traits\Serializer;

/**
 * Catégorie de matériel.
 *
 * @property-read ?int $id
 * @property string $name
 * @property-read bool $has_sub_categories
 * @property-read Carbon $created_at
 * @property-read Carbon|null $updated_at
 *
 * @property-read Collection|SubCategory[] $subCategories
 * @property-read Collection|SubCategory[] $sub_categories
 * @property-read Collection|Material[] $materials
 * @property-read Collection|Attribute[] $attributes
 * @property-read Collection|User[] $approvers
 */
final class Category extends BaseModel implements Serializable
{
    use Serializer;

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::custom([$this, 'checkName']),
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
        return $this->hasMany(Material::class)
            ->orderBy('id');
    }

    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'attribute_categories')
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
        return $this->getRelationValue('subCategories');
    }

    public function getHasSubCategoriesAttribute(): bool
    {
        return $this->subCategories->isNotEmpty();
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
