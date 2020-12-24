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

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name'                  => V::notEmpty()->length(2, 191),
            'reference'             => V::notEmpty()->alnum('.,-+/_ ')->length(2, 64),
            'park_id'               => V::notEmpty()->numeric(),
            'category_id'           => V::notEmpty()->numeric(),
            'sub_category_id'       => V::optional(V::numeric()),
            'rental_price'          => V::floatVal()->max(999999.99, true),
            'stock_quantity'        => V::intVal()->max(100000),
            'out_of_order_quantity' => V::optional(V::intVal()->max(100000)),
            'replacement_price'     => V::optional(V::floatVal()->max(999999.99, true)),
            'is_hidden_on_bill'     => V::optional(V::boolType()),
            'is_discountable'       => V::optional(V::boolType()),
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
            ->using('Robert2\API\Models\EventMaterialsPivot')
            ->withPivot('quantity')
            ->select(['events.id', 'title', 'start_date', 'end_date', 'is_confirmed']);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'name'                  => 'string',
        'reference'             => 'string',
        'description'           => 'string',
        'is_unitary'            => 'boolean',
        'park_id'               => 'integer',
        'category_id'           => 'integer',
        'sub_category_id'       => 'integer',
        'rental_price'          => 'float',
        'stock_quantity'        => 'integer',
        'out_of_order_quantity' => 'integer',
        'replacement_price'     => 'float',
        'is_hidden_on_bill'     => 'boolean',
        'is_discountable'       => 'boolean',
        'note'                  => 'string',
    ];

    public function getParkAttribute()
    {
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
        'note',
    ];

    // ------------------------------------------------------
    // -
    // -    Custom Methods
    // -
    // ------------------------------------------------------

    public function recalcQuantitiesForPeriod(
        array $data,
        string $start,
        string $end,
        ?int $exceptEventId = null
    ): array {
        if (empty($data)) {
            return [];
        }

        $Event = new Event();
        $events = $Event->setPeriod($start, $end)->getAll();
        if ($exceptEventId) {
            $events = $events->where('id', '!=', $exceptEventId);
        }
        $events = $events->with('Materials')->get()->toArray();

        $periods = $this->_getSplittedPeriods($events);

        foreach ($data as $index => $material) {
            $materialId = $material['id'];
            $remainingQuantity = (int)$material['stock_quantity'] - (int)$material['out_of_order_quantity'];
            $quantityPerPeriod = [0];

            foreach ($periods as $periodIndex => $period) {
                $quantityPerPeriod[$periodIndex] = 0;
                $overlapEvents = array_filter($events, function ($event) use ($period) {
                    return (strtotime($event['start_date']) < strtotime($period[1]) &&
                        strtotime($event['end_date']) > strtotime($period[0]));
                });

                foreach ($overlapEvents as $event) {
                    $eventMaterial = $this->_getMaterialFromEvent($materialId, $event);
                    if (empty($eventMaterial)) {
                        continue;
                    }
                    $quantityPerPeriod[$periodIndex] += $eventMaterial['pivot']['quantity'];
                }
            }

            $data[$index]['remaining_quantity'] = $remainingQuantity - max($quantityPerPeriod);
        }

        return $data;
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _getSplittedPeriods(array $events): array
    {
        $timeLine = [];
        foreach ($events as $event) {
            $timeLine[] = $event['start_date'];
            $timeLine[] = $event['end_date'];
        }

        $timeLine = array_unique($timeLine);
        $timeLineCount = count($timeLine);
        if ($timeLineCount < 2) {
            return [];
        }

        usort($timeLine, function ($dateTime1, $dateTime2) {
            if ($dateTime1 === $dateTime2) {
                return 0;
            }
            return strtotime($dateTime1) < strtotime($dateTime2) ? -1 : 1;
        });

        $periods = [];
        for ($i = 0; $i < $timeLineCount - 1; $i++) {
            $periods[] = [$timeLine[$i], $timeLine[$i + 1]];
        }

        return $periods;
    }

    protected function _getMaterialFromEvent(int $materialId, array $event): array
    {
        $eventMaterialIndex = array_search(
            $materialId,
            array_column($event['materials'], 'id')
        );

        return $eventMaterialIndex === false ? [] : $event['materials'][$eventMaterialIndex];
    }

    // ------------------------------------------------------
    // -
    // -    Static methods
    // -
    // ------------------------------------------------------

    public static function format(array $material): array
    {
        if (!$material['is_unitary']) {
            return $material;
        }

        return array_replace($material, [
            'stock_quantity' => 0,
            'out_of_order_quantity' => 0,
        ]);
    }
}
