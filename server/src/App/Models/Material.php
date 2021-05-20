<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Robert2\API\Validation\Validator as V;
use Robert2\API\Models\Traits\Taggable;
use Robert2\API\Models\User;

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
            'park_id' => V::callback([$this, 'checkParkId']),
            'category_id' => V::notEmpty()->numeric(),
            'sub_category_id' => V::optional(V::numeric()),
            'rental_price' => V::floatVal()->max(999999.99, true),
            'stock_quantity'  => V::callback([$this, 'checkStockQuantity']),
            'out_of_order_quantity' => V::callback([$this, 'checkOutOfOrderQuantity']),
            'replacement_price' => V::optional(V::floatVal()->max(999999.99, true)),
            'is_hidden_on_bill' => V::optional(V::boolType()),
            'is_discountable' => V::optional(V::boolType()),
            'picture' => V::optional(V::length(5, 191)),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkParkId($value)
    {
        if ($this->is_unitary) {
            return V::nullType();
        }
        return V::notEmpty()->numeric();
    }

    public function checkStockQuantity($value)
    {
        if ($this->is_unitary) {
            return V::nullType();
        }
        return V::intVal()->max(100000);
    }

    public function checkOutOfOrderQuantity($value)
    {
        if ($this->is_unitary) {
            return V::nullType();
        }
        return V::optional(V::intVal()->max(100000));
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = [
        'tags',
        'units',
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

    public function Units()
    {
        return $this->hasMany('Robert2\API\Models\MaterialUnit')
            ->select(['id', 'reference', 'serial_number', 'park_id', 'is_broken']);
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
            ->orderBy('start_date', 'desc')
            ->select(['events.id', 'title', 'start_date', 'end_date', 'location', 'is_confirmed']);
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
            $value = $this->Units()->count();
        }
        return $this->castAttribute('stock_quantity', $value);
    }

    public function getOutOfOrderQuantityAttribute($value)
    {
        if ($this->is_unitary) {
            $value = $this->Units()->where('is_broken', true)->count();
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

    public function getUnitsAttribute()
    {
        $units = $this->Units()->get();
        return $units ? $units->toArray() : [];
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
        'is_unitary',
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

        foreach ($data as &$material) {
            if ($material['is_unitary']) {
                $usedUnits = [];
                foreach ($events as $event) {
                    $eventMaterialIndex = array_search($material['id'], array_column($event['materials'], 'id'));
                    if ($eventMaterialIndex === false) {
                        continue;
                    }

                    $eventMaterial = $event['materials'][$eventMaterialIndex];
                    $usedUnits = array_merge($usedUnits, $eventMaterial['pivot']['units']);
                }

                // - Ajoute le champ `is_available` aux unités des matériels
                // + Supprime les unités marquées comme "utilisé" qui sont cassées.
                //   (=> Elles ne comptent pas dans le calcul des unités utilisées)
                if (array_key_exists('units', $material)) {
                    foreach ($material['units'] as &$unit) {
                        $unit['is_available'] = !in_array($unit['id'], $usedUnits, true);

                        if ($unit['is_broken']) {
                            $usedUnits = array_diff($usedUnits, [$unit['id']]);
                        }
                    }
                }

                $usedCount = count(array_unique($usedUnits));
            } else {
                $quantityPerPeriod = [0];
                $periods = splitPeriods($events);
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
                $usedCount = max($quantityPerPeriod);
            }

            $remainingQuantity = (int)$material['stock_quantity'] - (int)$material['out_of_order_quantity'];
            $material['remaining_quantity'] = max($remainingQuantity - $usedCount, 0);
        }

        return $data;
    }

    public function getAllFiltered(
        array $conditions,
        bool $withDeleted = false,
        bool $ignoreUnitaries = false
    ): Builder {
        $parkId = array_key_exists('park_id', $conditions) ? $conditions['park_id'] : null;
        unset($conditions['park_id']);

        $builder = parent::getAllFiltered($conditions, $withDeleted);

        if ($parkId) {
            $builder->where(function ($query) use ($parkId, $ignoreUnitaries) {
                $query->where('park_id', $parkId);

                if (!$ignoreUnitaries) {
                    $query->orWhereHas(
                        'units',
                        function ($subQuery) use ($parkId) {
                            $subQuery->where('park_id', $parkId);
                        }
                    );
                } else {
                    $query->orWhere('is_unitary', true);
                }
            });
        }

        return $builder;
    }

    public static function getOneForUser(int $id, ?int $userId = null): array
    {
        $material = static::findOrFail($id);
        $materialData = $material->toArray();

        if ($userId !== null && $material->is_unitary) {
            $restrictedParks = User::find($userId)->restricted_parks;
            if (!empty($restrictedParks)) {
                $units = $material->Units()->whereNotIn('park_id', $restrictedParks);
                $materialData['units'] = $units->get()->toArray();
                $materialData['stock_quantity'] = $units->count();
                $materialData['out_of_order_quantity'] = $units->where('is_broken', true)->count();
            }
        }

        return $materialData;
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
