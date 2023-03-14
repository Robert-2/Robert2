<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Brick\Math\BigDecimal as Decimal;
use Brick\Math\RoundingMode;
use Robert2\API\Models\Traits\TransientAttributes;

/**
 * Matériel utilisé dans un événement.
 *
 * @property-read ?int $id
 * @property-read int $event_id
 * @property-read Event $event
 * @property-read int $material_id
 * @property-read Material $material
 * @property-read bool $is_discountable
 * @property int $quantity
 * @property int $quantity_missing
 * @property-read Decimal|null $unit_price
 * @property-read Decimal|null $total_price
 * @property-read Decimal $unit_replacement_price
 * @property-read Decimal $total_replacement_price
 * @property int $quantity_returned
 * @property int $quantity_returned_broken
 */
final class EventMaterial extends BasePivot
{
    use TransientAttributes;

    protected $table = 'event_materials';

    public $incrementing = true;
    public $timestamps = false;

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'event_id' => 'integer',
        'material_id' => 'integer',
        'quantity' => 'integer',
        'quantity_returned' => 'integer',
        'quantity_returned_broken' => 'integer',
    ];

    public function getIsDiscountableAttribute(): bool
    {
        if (!$this->material) {
            throw new \LogicException(
                'The event material\'s related material is missing, ' .
                'this relation should always be defined.'
            );
        }
        return $this->material->is_discountable;
    }

    public function getQuantityMissingAttribute(): int
    {
        if (!$this->hasTransientAttribute('quantity_missing')) {
            throw new \LogicException(
                'The `quantity_missing` attribute should be set ' .
                'by the parent event before being accessed.'
            );
        }
        return $this->getTransientAttribute('quantity_missing');
    }

    public function getUnitPriceAttribute(): ?Decimal
    {
        if (!$this->material) {
            throw new \LogicException(
                'The event material\'s related material is missing, ' .
                'this relation should always be defined.'
            );
        }

        if (!$this->event->is_billable) {
            return null;
        }

        // Note: Le fait d'arriver jusqu'ici avec un prix à `null` ne devrait
        //       jamais arriver mais si le `billingMode` est changé dans le
        //       fichier de config. sans passer par l'edition de tous les
        //       matériels c'est ce qui se produira donc...
        return Decimal::of($this->material->rental_price ?? Decimal::zero())
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    public function getTotalPriceAttribute(): ?Decimal
    {
        if (!$this->event->is_billable) {
            return null;
        }

        return $this->unit_price
            ->multipliedBy($this->quantity)
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    public function getUnitReplacementPriceAttribute(): Decimal
    {
        if (!$this->material) {
            throw new \LogicException(
                'The event material\'s related material is missing, ' .
                'this relation should always be defined.'
            );
        }

        return Decimal::of($this->material->replacement_price ?? Decimal::zero())
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    public function getTotalReplacementPriceAttribute(): Decimal
    {
        return $this->unit_replacement_price
            ->multipliedBy($this->quantity)
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    public function setQuantityMissingAttribute(int $value)
    {
        $this->setTransientAttribute('quantity_missing', $value);
    }
}
