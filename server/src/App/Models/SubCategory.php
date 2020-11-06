<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Respect\Validation\Validator as V;

class SubCategory extends BaseModel
{
    use SoftDeletes;

    protected $table = 'sub_categories';

    protected $_modelName = 'SubCategory';
    protected $_orderField = 'name';
    protected $_orderDirection = 'asc';

    protected $_allowedSearchFields = ['name'];
    protected $_searchField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name'        => V::notEmpty()->length(2, 96),
            'category_id' => V::notEmpty()->numeric(),
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function Category()
    {
        return $this->belongsTo('Robert2\API\Models\Category')
            ->select(['id', 'name']);
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
            'serial_number',
        ];

        return $this->hasMany('Robert2\API\Models\Material')->select($fields);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'name'        => 'string',
        'category_id' => 'integer',
    ];

    public function getCategoryAttribute()
    {
        return $this->Category()->get()->toArray();
    }

    public function getMaterialsAttribute()
    {
        return $this->Materials()->get()->toArray();
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'name',
        'category_id'
    ];
}
