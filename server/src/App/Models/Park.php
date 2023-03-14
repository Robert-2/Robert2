<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Traits\Serializer;
use Respect\Validation\Validator as V;
use Robert2\API\Models\Traits\SoftDeletable;

/**
 * Parc de matériel.
 *
 * @property-read ?int $id
 * @property string $name
 * @property string|null $street
 * @property string|null $postal_code
 * @property string|null $locality
 * @property int|null $country_id
 * @property-read Country|null $country
 * @property string|null $opening_hours
 * @property string|null $note
 * @property-read int $total_items
 * @property-read int $total_stock_quantity
 * @property-read float $total_amount
 * @property-read bool $has_ongoing_booking
 * @property-read Collection|Material[] $materials
 * @property-read Carbon $created_at
 * @property-read Carbon $updated_at
 * @property-read Carbon|null $deleted_at
 *
 * @method static Builder|static forUser(int $userId)
 */
final class Park extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletable;

    protected $orderField = 'name';
    protected $searchField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::custom([$this, 'checkName']),
            'street' => V::optional(V::length(null, 191)),
            'postal_code' => V::optional(V::length(null, 10)),
            'locality' => V::optional(V::length(null, 191)),
            'country_id' => V::optional(V::numericVal()),
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
        return $this->hasMany(Material::class)
            ->orderBy('id');
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
        $total = $this->materials()->count();

        return $total;
    }

    public function getTotalStockQuantityAttribute()
    {
        $total = 0;

        $materials = $this->materials()->get(['stock_quantity']);
        foreach ($materials as $material) {
            $total += (int) $material->stock_quantity;
        }

        return $total;
    }

    public function getTotalAmountAttribute()
    {
        $total = 0;

        $materials = Material::getParkAll($this->id)->toArray();
        foreach ($materials as $material) {
            $total += ($material['replacement_price'] * (int) $material['stock_quantity']);
        }

        return $total;
    }

    public function getHasOngoingBookingAttribute()
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
