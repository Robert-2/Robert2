<?php
declare(strict_types=1);

namespace Loxya\Models;

use Brick\Math\BigDecimal as Decimal;
use Brick\Math\RoundingMode;
use Illuminate\Database\Eloquent\Relations\Concerns\AsPivot;
use Respect\Validation\Validator as V;
use Loxya\Contracts\Serializable;
use Loxya\Models\Traits\Serializer;
use Loxya\Models\Traits\TransientAttributes;

/**
 * Matériel utilisé dans un événement.
 *
 * @property-read ?int $id
 * @property int $event_id
 * @property-read Event $event
 * @property int $material_id
 * @property-read Material $material
 * @property-read bool $is_discountable
 * @property int $quantity
 * @property int $quantity_missing
 * @property-read Decimal|null $unit_price
 * @property-read Decimal|null $total_price
 * @property-read Decimal $unit_replacement_price
 * @property-read Decimal $total_replacement_price
 * @property string|null $departure_comment
 * @property int|null $quantity_departed
 * @property int|null $quantity_returned
 * @property int|null $quantity_returned_broken
 * @property-read bool $is_departure_inventory_filled
 * @property-read bool $is_return_inventory_filled
 */
final class EventMaterial extends BaseModel implements Serializable
{
    use AsPivot;
    use Serializer;
    use TransientAttributes;

    protected $table = 'event_materials';
    public $timestamps = false;

    protected $attributes = [
        'departure_comment' => null,
        'quantity_departed' => null,
        'quantity_returned' => null,
        'quantity_returned_broken' => null,
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'event_id' => V::custom([$this, 'checkEventId']),
            'material_id' => V::custom([$this, 'checkMaterialId']),
            'quantity' => V::intVal()->min(1),
            'quantity_departed' => V::custom([$this, 'checkQuantityDeparted']),
            'quantity_returned' => V::custom([$this, 'checkQuantityReturned']),
            'quantity_returned_broken' => V::custom([$this, 'checkQuantityReturnedBroken']),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkEventId($value)
    {
        // - L'identifiant de l'événement n'est pas encore défini, on skip.
        if (!$this->exists && $value === null) {
            return true;
        }
        return Event::staticExists($value);
    }

    public function checkMaterialId($value)
    {
        V::notEmpty()->numericVal()->check($value);

        $material = Material::find($value);
        if (!$material) {
            return false;
        }

        return !$this->exists || $this->isDirty('material_id')
            ? !$material->trashed()
            : true;
    }

    public function checkQuantityDeparted($value)
    {
        $quantityChecker = V::intVal()->min(0);

        $quantity = $this->getAttributeFromArray('quantity');
        $isValidQuantity = V::intVal()->min(1)->validate($quantity);
        if ($isValidQuantity) {
            $quantityChecker->max($quantity);
        }

        V::anyOf(V::nullType(), $quantityChecker)->check($value);

        // - L'événement courante n'est pas récupérable...
        //   => On ne peut pas vérifier son statut, on s'arrête là.
        if ($this->event === null) {
            return true;
        }

        // - Si la valeur n'a pas changée, on ne va pas plus loin
        //   même si la valeur en base est potentiellement invalide.
        //   (car ce n'est pas la responsabilité de cette sauvegarde
        //   que de traiter le souci)
        if ($this->exists && !$this->isDirty('quantity_departed')) {
            return true;
        }

        // NOTE: On pourrait être tenté de checker que, lorsque l'inventaire de départ
        //       est marqué comme effectué, la quantité de ce champ (`quantity_departed`)
        //       correspond bien à la quantité totale (`quantity`).
        //       Mais ceci ne doit pas être fait car on autorise la modification du matériel
        //       après la réalisation de l'inventaire de départ et ceci impliquerait de mettre
        //       automatiquement les nouvelles quantités dans ce champ lors des modifications,
        //       comme si cela avait été fait manuellement lors de l'inventaire de départ, ce
        //       qui n'est pas le cas.
        return !$this->event->is_departure_inventory_period_open
            ? V::nullType()
            : true;
    }

    public function checkQuantityReturned()
    {
        $quantityChecker = V::intVal()->min(0);
        if (V::intVal()->min(1)->validate($this->getAttributeFromArray('quantity'))) {
            $quantityChecker->max($this->getAttributeFromArray('quantity'));
        }
        return V::anyOf(V::nullType(), $quantityChecker);
    }

    public function checkQuantityReturnedBroken($value)
    {
        $quantityChecker = V::intVal()->min(0);
        if (V::intVal()->min(1)->validate($this->getAttributeFromArray('quantity'))) {
            $quantityChecker->max($this->getAttributeFromArray('quantity'));
        }

        $looseQuantityChecker = V::anyOf(V::nullType(), $quantityChecker);
        $looseQuantityChecker->check($value);

        // - Le champ `quantity_returned` n'est pas valide, on ne peut pas aller plus loin.
        $quantityReturned = $this->getAttributeFromArray('quantity_returned');
        if (!$looseQuantityChecker->validate($quantityReturned)) {
            return true;
        }

        // - Il ne peut pas y avoir plus de matériels retournés
        //   cassés que de matériels retournés tout court.
        return $quantityReturned === null || $value <= $quantityReturned;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function event()
    {
        return $this->belongsTo(Event::class)
            ->withTrashed();
    }

    public function material()
    {
        return $this->belongsTo(Material::class)
            ->withTrashed();
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
        'quantity_departed' => 'integer',
        'quantity_returned' => 'integer',
        'quantity_returned_broken' => 'integer',
        'departure_comment' => 'string',
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

    public function getQuantityDepartedAttribute($value): ?int
    {
        // - Si l'inventaire de départ est marqué comme terminé, on
        //   considère que tout est parti, même si `quantity_departed`
        //   n'est pas à jour (ne devrait toutefois pas arriver).
        return !$this->event?->is_departure_inventory_done
            ? $this->castAttribute('quantity_departed', $value)
            : $this->quantity;
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

    public function getIsDepartureInventoryFilledAttribute(): bool
    {
        if (!$this->material) {
            throw new \LogicException(
                'The event material\'s related material is missing, ' .
                'this relation should always be defined.'
            );
        }

        if ($this->quantity_departed !== $this->quantity) {
            return false;
        }

        return true;
    }

    public function getIsReturnInventoryFilledAttribute(): bool
    {
        return (
            $this->quantity_returned !== null &&
            $this->quantity_returned_broken !== null
        );
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'material_id',
        'quantity',
        'quantity_departed',
        'quantity_returned',
        'quantity_returned_broken',
        'departure_comment',
    ];

    public function setQuantityMissingAttribute(int $value): void
    {
        $this->setTransientAttribute('quantity_missing', $value);
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(): array
    {
        return $this->attributesForSerialization();
    }
}
