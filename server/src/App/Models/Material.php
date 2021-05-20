<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Validation\Validator as V;
use Robert2\API\Models\Traits\Taggable;

class Material extends BaseModel
{
    use SoftDeletes;
    use Taggable;

    protected $searchField = ['name', 'reference'];

    protected $attributes = [
        'name' => null,
        'description' => null,
        'reference' => null,
        'is_unitary' => false,
        'park_id' => null,
        'category_id' => null,
        'sub_category_id' => null,
        'rental_price' => null,
        'stock_quantity' => null,
        'out_of_order_quantity' => null,
        'replacement_price' => null,
        'is_hidden_on_bill' => false,
        'is_discountable' => true,
        'picture' => null,
        'note' => null,
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::notEmpty()->length(2, 191),
            'reference' => V::notEmpty()->alnum('.,-+/_ ')->length(2, 64),
            'park_id' => V::notEmpty()->numeric(),
            'category_id' => V::notEmpty()->numeric(),
            'sub_category_id' => V::optional(V::numeric()),
            'rental_price' => V::floatVal()->max(999999.99, true),
            'stock_quantity' => V::intVal()->max(100000),
            'out_of_order_quantity' => V::optional(V::intVal()->max(100000)),
            'replacement_price' => V::optional(V::floatVal()->max(999999.99, true)),
            'is_hidden_on_bill' => V::optional(V::boolType()),
            'is_discountable' => V::optional(V::boolType()),
            'picture' => V::optional(V::length(5, 191)),
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = [
        'tags',
        'attributes',
    ];

    public function Park()
    {
        return $this->belongsTo('Robert2\API\Models\Park')
            ->select(['id', 'name']);
    }

    public function Category()
    {
        return $this->belongsTo('Robert2\API\Models\Category')
            ->select(['id', 'name']);
    }

    public function SubCategory()
    {
        return $this->belongsTo('Robert2\API\Models\SubCategory')
            ->select(['id', 'name', 'category_id']);
    }

    public function Attributes()
    {
        return $this->belongsToMany('Robert2\API\Models\Attribute', 'material_attributes')
            ->using('Robert2\API\Models\MaterialAttributesPivot')
            ->withPivot('value')
            ->select(['attributes.id', 'attributes.name', 'attributes.type', 'attributes.unit']);
    }

    public function Events()
    {
        return $this->belongsToMany('Robert2\API\Models\Event', 'event_materials')
            ->using('Robert2\API\Models\EventMaterial')
            ->withPivot('id', 'quantity')
            ->select(['events.id', 'title', 'start_date', 'end_date', 'is_confirmed', 'is_closed']);
    }

    public function Documents()
    {
        return $this->hasMany('Robert2\API\Models\Document')
            ->orderBy('name', 'asc')
            ->select(['id', 'name', 'type', 'size']);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'name' => 'string',
        'reference' => 'string',
        'description' => 'string',
        'is_unitary' => 'boolean',
        'park_id' => 'integer',
        'category_id' => 'integer',
        'sub_category_id' => 'integer',
        'rental_price' => 'float',
        'stock_quantity' => 'integer',
        'out_of_order_quantity' => 'integer',
        'replacement_price' => 'float',
        'is_hidden_on_bill' => 'boolean',
        'is_discountable' => 'boolean',
        'picture' => 'string',
        'picture_path' => 'string',
        'note' => 'string',
    ];

    public function getStockQuantityAttribute($value)
    {
        if ($this->is_unitary) {
            $value = 0;
        }
        return $this->castAttribute('stock_quantity', $value);
    }

    public function getOutOfOrderQuantityAttribute($value)
    {
        if ($this->is_unitary) {
            $value = 0;
        }
        return $this->castAttribute('out_of_order_quantity', $value);
    }

    public function getParkAttribute()
    {
        if ($this->is_unitary) {
            return null;
        }

        $park = $this->Park()->first();
        return $park ? $park->toArray() : null;
    }

    public function getCategoryAttribute()
    {
        $category = $this->Category()->first();
        if (!$category) {
            return null;
        }
        $category = $category->toArray();
        unset($category['sub_categories']);

        return $category;
    }

    public function getSubCategoryAttribute()
    {
        $subCategory = $this->SubCategory()->first();
        return $subCategory ? $subCategory->toArray() : null;
    }

    public function getAttributesAttribute()
    {
        $attributes = $this->Attributes()->get();
        if (!$attributes) {
            return null;
        }
        return array_map(function ($attribute) {
            $type = $attribute['type'];
            $value = $attribute['pivot']['value'];
            if ($type === 'integer') {
                $value = (int)$value;
            }
            if ($type === 'float') {
                $value = (float)$value;
            }
            if ($type === 'boolean') {
                $value = $value === 'true' || $value === '1';
            }
            $attribute['value'] = $value;

            unset($attribute['pivot']);
            return $attribute;
        }, $attributes->toArray());
    }

    public function getEventsAttribute()
    {
        $events = $this->Events()->get();
        return $events ? $events->toArray() : null;
    }

    public function getDocumentsAttribute()
    {
        $documents = $this->Documents()->get();
        return $documents ? $documents->toArray() : null;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'name',
        'reference',
        'description',
        'park_id',
        'category_id',
        'sub_category_id',
        'rental_price',
        'stock_quantity',
        'out_of_order_quantity',
        'replacement_price',
        'is_hidden_on_bill',
        'is_discountable',
        'picture',
        'note',
    ];

    // ------------------------------------------------------
    // -
    // -    Custom Methods
    // -
    // ------------------------------------------------------

    public static function recalcQuantitiesForPeriod(
        array $data,
        string $start,
        string $end,
        ?int $exceptEventId = null
    ): array {
        if (empty($data)) {
            return [];
        }

        $events = (new Event)->setPeriod($start, $end)->getAll();
        if ($exceptEventId) {
            $events = $events->where('id', '!=', $exceptEventId);
        }

        $events = $events->with('Materials')->get()->toArray();
        $periods = splitPeriods($events);

        foreach ($data as &$material) {
            $quantityPerPeriod = [0];
            foreach ($periods as $periodIndex => $period) {
                $overlapEvents = array_filter($events, function ($event) use ($period) {
                    return (
                        strtotime($event['start_date']) < strtotime($period[1]) &&
                        strtotime($event['end_date']) > strtotime($period[0])
                    );
                });

                $quantityPerPeriod[$periodIndex] = 0;
                foreach ($overlapEvents as $event) {
                    $eventMaterialIndex = array_search($material['id'], array_column($event['materials'], 'id'));
                    if ($eventMaterialIndex === false) {
                        continue;
                    }

                    $eventMaterial = $event['materials'][$eventMaterialIndex];
                    $quantityPerPeriod[$periodIndex] += $eventMaterial['pivot']['quantity'];
                }
            }

            $remainingQuantity = (int)$material['stock_quantity'] - (int)$material['out_of_order_quantity'];
            $material['remaining_quantity'] = max($remainingQuantity - max($quantityPerPeriod), 0);
        }

        return $data;
    }

    public static function getPicturePath(int $id, ?string $pictureName = null)
    {
        $path = DATA_FOLDER . DS . 'materials'. DS . $id;
        if ($pictureName) {
            $path .= DS . $pictureName;
        }
        return $path;
    }
}
