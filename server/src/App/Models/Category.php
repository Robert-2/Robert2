<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Validation\Validator as V;
use Robert2\API\Errors\ValidationException;

class Category extends BaseModel
{
    use SoftDeletes;

    protected $table = 'categories';

    protected $_modelName = 'Category';
    protected $_orderField = 'name';
    protected $_orderDirection = 'asc';

    protected $_allowedSearchFields = ['name'];
    protected $_searchField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::notEmpty()->length(2, 96)
        ];
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
        return $this->hasMany('Robert2\API\Models\SubCategory')
            ->select(['id', 'name', 'category_id'])
            ->orderBy('name');
    }

    public function Materials()
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

        return $this->hasMany('Robert2\API\Models\Material')->select($fields);
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
        $categories = self::whereIn('name', $names)->get();
        $ids = [];
        foreach ($categories as $category) {
            $ids[] = $category->id;
        }
        return $ids;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = ['name'];

    public function bulkAdd(array $categoriesNames = []): array
    {
        $categories = [];
        foreach ($categoriesNames as $categoryName) {
            $existingCategory = self::getIdsByNames([$categoryName]);
            if (!empty($existingCategory)) {
                continue;
            }

            $safeCategory = ['name' => trim($categoryName)];
            $this->validate($safeCategory);

            $categories[] = $safeCategory;
        }

        $results = [];
        foreach ($categories as $categoryData) {
            $results[] = self::edit(null, $categoryData);
        }

        return $results;
    }
}
