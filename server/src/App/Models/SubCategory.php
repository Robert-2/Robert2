<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Loxya\Contracts\Serializable;
use Loxya\Models\Traits\Serializer;
use Loxya\Support\Assert;
use Respect\Validation\Validator as V;

/**
 * Sous-catégorie de matériel.
 *
 * @property-read ?int $id
 * @property string $name
 * @property int $category_id
 * @property-read Category $category
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
 *
 * @property-read Collection<array-key, Material> $materials
 *
 * @method static Builder|static search(string $term)
 */
final class SubCategory extends BaseModel implements Serializable
{
    use Serializer;

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

        $alreadyExists = static::query()
            ->where('name', $value)
            ->where('category_id', $this->category_id)
            ->when($this->exists, fn (Builder $subQuery) => (
                $subQuery->where('id', '!=', $this->id)
            ))
            ->exists();

        return !$alreadyExists ?: 'subcategory-already-in-use-for-this-category';
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
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
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
    // -    Query Scopes
    // -
    // ------------------------------------------------------

    protected $orderable = ['name'];

    public function scopeSearch(Builder $query, string $term): Builder
    {
        Assert::minLength($term, 2, "The term must contain more than two characters.");

        $term = sprintf('%%%s%%', addcslashes($term, '%_'));
        return $query->where('name', 'LIKE', $term);
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
