<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Traits\Serializer;
use Robert2\API\Validation\Validator as V;

/**
 * Modèle Park.
 *
 * @method static Builder forUser(Builder $query, int $userId)
 */
class Park extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletes;

    protected $orderField = 'name';
    protected $searchField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::callback([$this, 'checkName']),
            'street' => V::optional(V::length(null, 191)),
            'postal_code' => V::optional(V::length(null, 10)),
            'locality' => V::optional(V::length(null, 191)),
            'country_id' => V::optional(V::numeric()),
            'opening_hours' => V::optional(V::length(null, 255)),
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

        if ($query->withTrashed()->exists()) {
            return 'park-name-already-in-use';
        }

        return true;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function materials()
    {
        return $this->hasMany(Material::class);
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $appends = [
        'total_items',
        'total_stock_quantity',
    ];

    protected $casts = [
        'name' => 'string',
        'street' => 'string',
        'postal_code' => 'string',
        'locality' => 'string',
        'country_id' => 'integer',
        'opening_hours' => 'string',
        'note' => 'string',
    ];

    public function getTotalItemsAttribute()
    {
        $total = $this->materials()->where('is_unitary', false)->count();

        return $total;
    }

    public function getTotalStockQuantityAttribute()
    {
        $materials = $this->Materials()->get(['stock_quantity']);
        $total = 0;

        $materials = $this->materials()->get(['stock_quantity', 'is_unitary']);
        foreach ($materials as $material) {
            $total += (int)$material->stock_quantity;
        }

        return $total;
    }

    public function getTotalAmountAttribute()
    {
        $total = 0;

        $materials = Material::getParkAll($this->id)->toArray();
        foreach ($materials as $material) {
            $total += ($material['replacement_price'] * (int)$material['stock_quantity']);
        }

        return $total;
    }

    public function getHasOngoingEventAttribute()
    {
        if (!$this->exists || !$this->id) {
            return false;
        }

        $ongoingEvents = Event::inPeriod('today')
            ->with('materials')
            ->get();

        foreach ($ongoingEvents as $ongoingEvent) {
            foreach ($ongoingEvent->materials as $material) {
                if ($material->park_id === $this->id) {
                    return true;
                }
            }
        }

        return false;
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'name',
        'street',
        'postal_code',
        'locality',
        'country_id',
        'opening_hours',
        'note',
    ];

    public function delete()
    {
        if ($this->total_items > 0) {
            throw new \LogicException(
                sprintf("The park #%d contains material and therefore cannot be deleted.", $this->id)
            );
        }

        return parent::delete();
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
            $data['deleted_at'],
        );

        return $data;
    }
}
