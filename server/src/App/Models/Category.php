<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Loxya\Contracts\Serializable;
use Loxya\Models\Traits\Serializer;
use Respect\Validation\Validator as V;

/**
 * Catégorie de matériel.
 *
 * @property-read ?int $id
 * @property string $name
 * @property-read bool $has_sub_categories
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
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

        return !$query->exists() ?: 'category-name-already-in-use';
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
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
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
    // -    Méthodes de "repository"
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
        return (new DotArray($this->attributesForSerialization()))
            ->delete(['created_at', 'updated_at'])
            ->all();
    }
}
