<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Brick\Math\BigDecimal as Decimal;
use Brick\Math\RoundingMode;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection as CoreCollection;
use Respect\Validation\Validator as V;
use Respect\Validation\Rules as Rule;
use Loxya\Config\Config;
use Loxya\Contracts\Bookable;
use Loxya\Contracts\PeriodInterface;
use Loxya\Contracts\Serializable;
use Loxya\Errors\Exception\ConflictException;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\Traits\Cache;
use Loxya\Models\Traits\Serializer;
use Loxya\Models\Traits\SoftDeletable;
use Loxya\Models\Traits\TransientAttributes;
use Loxya\Services\I18n;
use Loxya\Support\Collections\MaterialsCollection;
use Loxya\Support\FullDuration;
use Loxya\Support\Pdf;
use Loxya\Support\Str;
use Symfony\Contracts\Cache\ItemInterface as CacheItemInterface;

/**
 * Événement.
 *
 * @property-read ?int $id
 * @property string $title
 * @property string|null $reference
 * @property string|null $description
 * @property string|null $location
 * @property string $start_date
 * @property string $end_date
 * @property-read FullDuration $duration
 * @property string|null $color
 * @property-read Decimal|null $degressive_rate
 * @property Decimal|null $discount_rate
 * @property-read Decimal|null $vat_rate
 * @property-read Decimal|null $daily_total_without_discount
 * @property-read Decimal|null $daily_total_discountable
 * @property-read Decimal|null $daily_total_discount
 * @property-read Decimal|null $daily_total_without_taxes
 * @property-read Decimal|null $daily_total_taxes
 * @property-read Decimal|null $daily_total_with_taxes
 * @property-read Decimal|null $total_without_taxes
 * @property-read Decimal|null $total_taxes
 * @property-read Decimal|null $total_with_taxes
 * @property-read Decimal $total_replacement
 * @property-read string $currency
 * @property bool $is_confirmed
 * @property bool $is_archived
 * @property bool $is_billable
 * @property-read bool $is_departure_inventory_period_open
 * @property-read bool $is_departure_inventory_period_closed
 * @property-read bool $can_finish_departure_inventory
 * @property bool $is_departure_inventory_done
 * @property string|null $departure_inventory_datetime
 * @property int|null $departure_inventory_author_id
 * @property-read User|null $departure_inventory_author
 * @property-read bool $is_return_inventory_period_open
 * @property-read bool $can_finish_return_inventory
 * @property-read bool $is_return_inventory_started
 * @property bool $is_return_inventory_done
 * @property string|null $return_inventory_datetime
 * @property int|null $return_inventory_author_id
 * @property-read User|null $return_inventory_author
 * @property-read bool|null $has_missing_materials
 * @property-read bool|null $has_not_returned_materials
 * @property-read bool $is_editable
 * @property-read int[] $categories
 * @property-read int[] $parks
 * @property-read array $totalisable_attributes
 * @property string|null $note
 * @property int|null $author_id
 * @property-read User|null $author
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
 * @property-read CarbonImmutable|null $deleted_at
 *
 * @property-read Collection|EventTechnician[] $technicians
 * @property-read Collection|Beneficiary[] $beneficiaries
 * @property-read Collection|Material[] $materials
 * @property-read Collection|Estimate[] $estimates
 * @property-read Collection|Invoice[] $invoices
 * @property-read Collection|Document[] $documents
 *
 * @method static Builder|static inPeriod(PeriodInterface $period)
 * @method static Builder|static inPeriod(string|Carbon $start, string|Carbon|null $end)
 * @method static Builder|static inPeriod(string|Carbon|PeriodInterface $start, string|Carbon|null $end = null)
 * @method static Builder|static notReturned(Carbon|PeriodInterface $dateOrPeriod)
 */
final class Event extends BaseModel implements Serializable, PeriodInterface, Bookable
{
    use Serializer;
    use SoftDeletable;
    use Cache;
    use TransientAttributes;

    /** L'identifiant unique du modèle. */
    public const TYPE = 'event';

    // - Types de sérialisation.
    public const SERIALIZE_DEFAULT = 'default';
    public const SERIALIZE_SUMMARY = 'summary';
    public const SERIALIZE_BOOKING_DEFAULT = 'booking-default';
    public const SERIALIZE_BOOKING_SUMMARY = 'booking-summary';
    public const SERIALIZE_DETAILS = 'details';

    /**
     * Cette variable peut être utilisée pour mettre en cache les bookables
     * qui se déroulent en même temps que celui de l'instance courante.
     *
     * @var Collection|(Event|Cart|Reservation)[]
     */
    public ?CoreCollection $__cachedConcurrentBookables = null;

    protected const PDF_TEMPLATE = 'event-summary-default';

    protected $searchField = 'title';
    protected $orderField = 'start_date';

    protected $attributes = [
        'color' => null,
        'is_archived' => false,
        'is_departure_inventory_done' => false,
        'departure_inventory_datetime' => null,
        'departure_inventory_author_id' => null,
        'is_return_inventory_done' => false,
        'return_inventory_datetime' => null,
        'return_inventory_author_id' => null,
        'note' => null,
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'title' => V::notEmpty()->length(2, 191),
            'reference' => V::custom([$this, 'checkReference']),
            'start_date' => V::notEmpty()->dateTime(),
            'end_date' => V::custom([$this, 'checkEndDate']),
            'color' => V::optional(V::custom([$this, 'checkColor'])),
            'is_confirmed' => V::notOptional()->boolType(),
            'is_archived' => V::custom([$this, 'checkIsArchived']),
            'is_billable' => V::optional(V::boolType()),
            'is_departure_inventory_done' => V::boolType(),
            'departure_inventory_datetime' => V::custom([$this, 'checkDepartureInventoryDatetime']),
            'departure_inventory_author_id' => V::custom([$this, 'checkDepartureInventoryAuthorId']),
            'is_return_inventory_done' => V::boolType(),
            'return_inventory_datetime' => V::custom([$this, 'checkReturnInventoryDatetime']),
            'return_inventory_author_id' => V::custom([$this, 'checkReturnInventoryAuthorId']),
            'author_id' => V::custom([$this, 'checkAuthorId']),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkReference($value)
    {
        V::create()
            ->nullable(V::alnum('.,-/_ ')->length(1, 64))
            ->check($value);

        if (!$value) {
            return true;
        }

        $query = static::where('reference', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        return !$query->withTrashed()->exists()
            ?: 'reference-already-in-use';
    }

    public function checkEndDate($value)
    {
        $dateChecker = V::notEmpty()->dateTime();
        if (!$dateChecker->validate($value)) {
            return 'invalid-date';
        }

        if (!$dateChecker->validate($this->start_date)) {
            return true;
        }

        $startDate = new Carbon($this->start_date);
        $endDate = new Carbon($this->end_date);

        return $startDate < $endDate ?: 'end-date-must-be-later';
    }

    public function checkColor($value)
    {
        $colorChecker = V::regex('/^#?[0-9a-f]{6}$/i');
        return $colorChecker->validate($value) ?: 'invalid-hexadecimal-color';
    }

    public function checkIsArchived($value)
    {
        V::boolType()->check($value);

        if (!$value) {
            return true;
        }

        $boolChecker = V::notOptional()->boolType();
        if (!$boolChecker->validate($value)) {
            return false;
        }

        $dateChecker = V::notEmpty()->dateTime();
        if (!$dateChecker->validate($this->getAttributeFromArray('end_date'))) {
            return false;
        }

        $isPastAndInventoryDone = (
            (new Carbon($this->getAttributeFromArray('end_date'))) < Carbon::now()
            && $this->is_return_inventory_done
        );

        return $isPastAndInventoryDone ?: 'event-cannot-be-archived';
    }

    public function checkAuthorId($value)
    {
        V::optional(V::numericVal())->check($value);

        // - Si le champ est vide ou qu'on est dans un update et que le
        //   champ n'a pas changé, on laisse passer.
        if ($value === null || ($this->exists && !$this->isDirty('author_id'))) {
            return true;
        }

        $author = User::find($value);
        return $author && !$author->trashed();
    }

    public function checkDepartureInventoryAuthorId($value)
    {
        V::optional(V::numericVal())->check($value);

        if (!$this->is_departure_inventory_done) {
            return V::nullType();
        }

        // - Si le champ est vide ou qu'on est dans un update et que le
        //   champ n'a pas changé, on laisse passer.
        if ($value === null || ($this->exists && !$this->isDirty('departure_inventory_author_id'))) {
            return true;
        }

        $author = User::find($value);
        return $author && !$author->trashed();
    }

    public function checkDepartureInventoryDatetime($value)
    {
        $dateChecker = V::optional(V::dateTime());
        if (!$dateChecker->validate($value)) {
            return 'invalid-date';
        }

        return !$this->is_departure_inventory_done
            ? V::nullType()
            : true;
    }

    public function checkReturnInventoryAuthorId($value)
    {
        V::optional(V::numericVal())->check($value);

        if (!$this->is_return_inventory_done) {
            return V::nullType();
        }

        // - Si le champ est vide ou qu'on est dans un update et que le
        //   champ n'a pas changé, on laisse passer.
        if ($value === null || ($this->exists && !$this->isDirty('return_inventory_author_id'))) {
            return true;
        }

        $author = User::find($value);
        return $author && !$author->trashed();
    }

    public function checkReturnInventoryDatetime($value)
    {
        $dateChecker = V::optional(V::dateTime());
        if (!$dateChecker->validate($value)) {
            return 'invalid-date';
        }

        return !$this->is_return_inventory_done
            ? V::nullType()
            : true;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function technicians()
    {
        return $this->hasMany(EventTechnician::class, 'event_id')
            ->orderBy('start_time');
    }

    public function beneficiaries()
    {
        return $this->belongsToMany(Beneficiary::class, 'event_beneficiaries')
            ->orderByPivot('id');
    }

    public function materials()
    {
        return $this->belongsToMany(Material::class, 'event_materials')
            ->using(EventMaterial::class)
            ->withPivot([
                'id',
                'quantity',
                'quantity_departed',
                'quantity_returned',
                'quantity_returned_broken',
                'departure_comment',
            ])
            ->orderByPivot('id');
    }

    public function invoices()
    {
        return $this->morphMany(Invoice::class, 'booking')
            ->orderBy('date', 'desc');
    }

    public function estimates()
    {
        return $this->morphMany(Estimate::class, 'booking')
            ->orderBy('date', 'desc');
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'entity')
            ->orderBy('name', 'asc');
    }

    public function author()
    {
        return $this->belongsTo(User::class)
            ->withTrashed();
    }

    public function departureInventoryAuthor()
    {
        return $this->belongsTo(User::class, 'departure_inventory_author_id')
            ->withTrashed();
    }

    public function returnInventoryAuthor()
    {
        return $this->belongsTo(User::class, 'return_inventory_author_id')
            ->withTrashed();
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'reference' => 'string',
        'title' => 'string',
        'description' => 'string',
        'start_date' => 'string',
        'end_date' => 'string',
        'color' => 'string',
        'is_confirmed' => 'boolean',
        'is_archived' => 'boolean',
        'location' => 'string',
        'is_billable' => 'boolean',
        'is_departure_inventory_done' => 'boolean',
        'departure_inventory_datetime' => 'string',
        'departure_inventory_author_id' => 'integer',
        'is_return_inventory_done' => 'boolean',
        'return_inventory_datetime' => 'string',
        'return_inventory_author_id' => 'integer',
        'note' => 'string',
        'author_id' => 'integer',
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
        'deleted_at' => 'immutable_datetime',
    ];

    public function getBeneficiariesAttribute()
    {
        return $this->getRelationValue('beneficiaries')
            ->sortBy('last_name')
            ->values();
    }

    public function getTechniciansAttribute()
    {
        return $this->getRelationValue('technicians');
    }

    public function getMaterialsAttribute()
    {
        return $this->getRelationValue('materials');
    }

    public function getEstimatesAttribute()
    {
        return $this->getRelationValue('estimates');
    }

    public function getInvoicesAttribute()
    {
        return $this->getRelationValue('invoices');
    }

    public function getDurationAttribute(): FullDuration
    {
        return new FullDuration($this);
    }

    public function getDegressiveRateAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        $result = null;
        $jsFunction = Config::get('degressiveRateFunction');
        if (!empty($jsFunction) && str_contains($jsFunction, 'daysCount')) {
            $function = preg_replace('/daysCount/', (string) $this->duration->getDays(), $jsFunction);
            eval(sprintf('$result = %s;', $function)); // phpcs:ignore Squiz.PHP.Eval
        }

        return Decimal::of($result && is_numeric($result) ? $result : $this->duration->getDays())
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    public function getDiscountRateAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }
        return $this->getTransientAttribute('discount_rate', Decimal::zero());
    }

    public function getCurrencyAttribute(): string
    {
        return Config::get('currency.iso');
    }

    public function getVatRateAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return Decimal::of(Config::get('companyData.vatRate') ?: 0)
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    public function getAuthorAttribute()
    {
        return $this->getRelationValue('author');
    }

    public function getDepartureInventoryAuthorAttribute()
    {
        return $this->getRelationValue('departureInventoryAuthor');
    }

    public function getReturnInventoryAuthorAttribute()
    {
        return $this->getRelationValue('returnInventoryAuthor');
    }

    public function getIsEditableAttribute(): bool
    {
        return (
            // - Un événement archivé n'est pas modifiable.
            !$this->is_archived &&

            // - Un événement ne peut être modifié que si son inventaire de retour
            //   n'a pas été effectué (sans quoi celui-ci n'aurait plus aucun sens,
            //   d'autant que le stock global a pu être impacté suite à cet inventaire).
            !$this->is_return_inventory_done
        );
    }

    public function getParksAttribute()
    {
        $parkIds = $this->materials->reduce(
            function (array $parkIds, Material $material) {
                $parkIds[] = $material->park_id;
                return $parkIds;
            },
            [],
        );
        return array_values(array_unique($parkIds));
    }

    public function getCategoriesAttribute()
    {
        return $this->materials
            ->pluck('category_id')
            ->unique()
            ->values()
            ->all();
    }

    public function getTotalisableAttributesAttribute(): array
    {
        return $this->materials->reduce(
            function ($totals, $material) {
                $quantity = $material->pivot->quantity;

                foreach ($material->attributes as $attribute) {
                    if (!$attribute->is_totalisable) {
                        continue;
                    }

                    $currentTotal = $quantity * $attribute->value;

                    if (!array_key_exists($attribute->id, $totals)) {
                        $totals[$attribute->id] = $attribute->fresh();
                    }

                    $previousTotal = $totals[$attribute->id]->value ?? 0;
                    $totals[$attribute->id]->value = $previousTotal + $currentTotal;
                }

                return $totals;
            },
            [],
        );
    }

    //
    // - Daily totals.
    //

    public function getDailyTotalWithoutDiscountAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->materials->pluck('pivot')
            ->reduce(
                fn (Decimal $currentTotal, EventMaterial $material) => (
                    $currentTotal->plus($material->total_price)
                ),
                Decimal::zero()
            )
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    public function getDailyTotalDiscountableAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->materials->pluck('pivot')
            ->reduce(
                fn (Decimal $currentTotal, EventMaterial $material) => (
                    $material->is_discountable
                        ? $currentTotal->plus($material->total_price)
                        : $currentTotal
                ),
                Decimal::zero()
            )
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    public function getDailyTotalDiscountAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->daily_total_without_discount
            ->multipliedBy($this->discount_rate->dividedBy(100, 6))
            // @see https://www.ibm.com/docs/en/order-management-sw/9.2.1?topic=rounding-price
            // @see https://wiki.dolibarr.org/index.php?title=VAT_setup,_calculation_and_rounding_rules
            ->toScale(2, RoundingMode::HALF_UP);
    }

    public function getDailyTotalWithoutTaxesAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->daily_total_without_discount
            ->minus($this->daily_total_discount)
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    public function getDailyTotalTaxesAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->daily_total_without_taxes
            ->multipliedBy($this->vat_rate->dividedBy(100, 4))
            // @see https://www.ibm.com/docs/en/order-management-sw/9.2.1?topic=rounding-price
            // @see https://wiki.dolibarr.org/index.php?title=VAT_setup,_calculation_and_rounding_rules
            ->toScale(2, RoundingMode::HALF_UP);
    }

    public function getDailyTotalWithTaxesAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->daily_total_without_taxes
            ->plus($this->daily_total_taxes)
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    //
    // - Totals.
    //

    public function getTotalWithoutTaxesAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->daily_total_without_taxes
            ->multipliedBy($this->degressive_rate)
            // @see https://www.ibm.com/docs/en/order-management-sw/9.2.1?topic=rounding-price
            // @see https://wiki.dolibarr.org/index.php?title=VAT_setup,_calculation_and_rounding_rules
            ->toScale(2, RoundingMode::HALF_UP);
    }

    public function getTotalTaxesAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->total_without_taxes
            ->multipliedBy($this->vat_rate->dividedBy(100, 4))
            // @see https://www.ibm.com/docs/en/order-management-sw/9.2.1?topic=rounding-price
            // @see https://wiki.dolibarr.org/index.php?title=VAT_setup,_calculation_and_rounding_rules
            ->toScale(2, RoundingMode::HALF_UP);
    }

    public function getTotalWithTaxesAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->total_without_taxes
            ->plus($this->total_taxes)
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    public function getTotalReplacementAttribute(): ?Decimal
    {
        return $this->materials->pluck('pivot')
            ->reduce(
                fn (Decimal $currentTotal, EventMaterial $material) => (
                    $currentTotal->plus($material->total_replacement_price)
                ),
                Decimal::zero()
            )
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    //
    // - Booleans
    //

    public function getHasMissingMaterialsAttribute()
    {
        if (!$this->exists || $this->is_archived) {
            return null;
        }

        // - Si l'événement est passé ET que l'inventaire de retour est fait,
        //   la disponibilité du matériel n'est pas calculée.
        if ($this->getEndDate() < Carbon::today() && $this->is_return_inventory_done) {
            return null;
        }

        return $this->cacheGet(
            'has_missing_materials',
            function (?CacheItemInterface $cacheItem) {
                if ($cacheItem) {
                    $cacheItem->expiresAfter(new \DateInterval('P1D'));
                }
                return $this->missingMaterials()->isNotEmpty();
            }
        );
    }

    public function getIsDepartureInventoryPeriodOpenAttribute(): bool
    {
        // FIXME: Lorsque les dates de mobilisation auront été implémentées,
        //        on devra pouvoir commencer l'inventaire de départ quand on
        //        veut avant le début de l'événement et cela "bougera" la date
        //        de début de mobilisation à cette date.
        $inventoryPeriodStart = $this->getStartDate()->subDay();
        return $inventoryPeriodStart->lte(Carbon::now());
    }

    public function getIsDepartureInventoryPeriodClosedAttribute(): bool
    {
        // - Si l'inventaire de retour est fait, la période de réalisation
        //   des inventaires de départ est forcément fermée.
        if ($this->is_return_inventory_done) {
            return true;
        }

        // NOTE 1: C'est la date de début d'événement qui fait foi pour permettre
        //         de calculer la période d'ouverture de l'inventaire de départ, pas
        //         la date de début de mobilisation. La date de début de mobilisation
        //         est la résultante de cet inventaire de départ.
        // NOTE 2: On laisse un délai de 1 jour après la date de départ pour faire
        //         l'inventaire de départ (mais en ne dépassant jamais la date de
        //         fin d'événement).
        // FIXME: Lorsque les dates de mobilisation auront été implémentées, il ne
        //        faudra permettre les inventaires de départ que jusqu'à la date de
        //        début de l'événement.
        $inventoryPeriodCloseDate = $this->getStartDate()->addDay();
        if ($inventoryPeriodCloseDate->isAfter($this->getEndDate())) {
            $inventoryPeriodCloseDate = $this->getEndDate();
        }

        return $inventoryPeriodCloseDate->isBefore(Carbon::now());
    }

    public function getCanFinishDepartureInventoryAttribute(): bool
    {
        if ($this->is_archived) {
            return false;
        }

        if ($this->is_departure_inventory_done) {
            return false;
        }

        if (!$this->is_departure_inventory_period_open) {
            return false;
        }

        if ($this->is_departure_inventory_period_closed) {
            return false;
        }

        if ($this->materials->isEmpty()) {
            return false;
        }

        // FIXME: À re-activer lorsque les inventaires de retour terminés
        //        rendront disponibles les stocks utilisés dans l'événement
        //        (en bougeant la date de fin de mobilisation) OU quand la
        //        gestion horaire aura été implémentée.
        //        Sans ça, pour les événements qui partent juste après un autre
        //        dont l'inventaire de retour a été terminé, sur un même jour,
        //        on est bloqué car le système pense qu'il y a une pénurie.
        // if ($this->has_missing_materials) {
        //     return false;
        // }

        return $this->materials->every(
            fn ($material) => $material->pivot->is_departure_inventory_filled
        );
    }

    public function getIsReturnInventoryPeriodOpenAttribute(): bool
    {
        // NOTE: C'est la date de début d'événement qui fait foi pour permettre
        //       le retour, pas la date de début de mobilisation.
        //       (sans quoi on pourrait faire le retour d'un événement avant même
        //       qu'il ait réellement commencé, ce qui n'a pas de sens).
        return $this->getStartDate()->isPast();
    }

    public function getCanFinishReturnInventoryAttribute(): bool
    {
        if ($this->is_archived) {
            return false;
        }

        if ($this->is_return_inventory_done) {
            return false;
        }

        if (!$this->is_return_inventory_period_open) {
            return false;
        }

        if ($this->materials->isEmpty()) {
            return false;
        }

        // FIXME: À re-activer lorsque les inventaires de retour terminés
        //        rendront disponibles les stocks utilisés dans l'événement
        //        (en bougeant la date de fin de mobilisation) OU quand la
        //        gestion horaire aura été implémentée.
        //        Sans ça, pour les événements qui partent juste après un autre
        //        dont l'inventaire de retour a été terminé, sur un même jour,
        //        on est bloqué car le système pense qu'il y a une pénurie.
        // if ($this->has_missing_materials) {
        //     return false;
        // }

        // FIXME: Cette condition devra être supprimée lorsque les dates de
        //        mobilisation auront été implémentées.
        // - L'inventaire de retour ne peut pas être marqué comme terminé
        //   avant le jour de fin de l'événement.
        $endDate = $this->getEndDate();
        if (!$endDate->isPast() && !$endDate->isSameDay()) {
            return false;
        }

        return $this->materials->every(
            fn ($material) => $material->pivot->is_return_inventory_filled
        );
    }

    public function getIsReturnInventoryStartedAttribute(): bool
    {
        // - Si l'inventaire de retour est terminé, c'est qu'il a forcément commencé.
        if ($this->is_return_inventory_done) {
            return true;
        }

        // - Si l'inventaire de retour ne peut pas être réalisé, il ne peut pas avoir commencé.
        if (!$this->is_return_inventory_period_open) {
            return false;
        }

        // - S'il existe au moins une quantité retournée non nulle,
        //   c'est que l'inventaire de retour a été sauvegardé au moins une fois.
        return $this->materials->whereNotNull('pivot.quantity_returned')->isNotEmpty();
    }

    public function getHasNotReturnedMaterialsAttribute()
    {
        // - Pas de calcul pour les réservations archivées (ou pas encore persistées).
        if (!$this->exists || $this->is_archived) {
            return null;
        }

        // - Si l'inventaire n'a pas encore été effectué, on a pas l'information.
        if (!$this->is_return_inventory_done) {
            return null;
        }

        // - S'il n'y a pas de material dans l'événement, il ne peut pas y avoir de manque.
        if ($this->materials->isEmpty()) {
            return false;
        }

        return $this->cacheGet(
            'has_not_returned_materials',
            function (?CacheItemInterface $cacheItem) {
                if ($cacheItem) {
                    $cacheItem->expiresAfter(new \DateInterval('P1D'));
                }

                return $this->materials->some(fn ($material) => (
                    ($material->pivot->quantity - ($material->pivot->quantity_returned ?? 0)) > 0
                ));
            }
        );
    }

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getStartDate(): CarbonImmutable
    {
        return (new Carbon($this->start_date))
            ->startOfDay()
            ->toImmutable();
    }

    public function getEndDate(): CarbonImmutable
    {
        return (new Carbon($this->end_date))
            ->setTime(23, 59, 59)
            ->toImmutable();
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'reference',
        'title',
        'description',
        'start_date',
        'end_date',
        'color',
        'is_confirmed',
        'location',
        'is_billable',
        'note',
        'author_id',
    ];

    public function setReferenceAttribute($value): void
    {
        $value = is_string($value) ? trim($value) : $value;
        $this->attributes['reference'] = $value;
    }

    public function setNoteAttribute($value): void
    {
        $value = is_string($value) ? trim($value) : $value;
        $this->attributes['note'] = $value === '' ? null : $value;
    }

    public function setDiscountRateAttribute(Decimal $value): void
    {
        if (!$this->is_billable) {
            throw new \LogicException("Unable to set a discount rate on a non-billable event.");
        }
        $this->setTransientAttribute('discount_rate', $value);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes liées à une "entity"
    // -
    // ------------------------------------------------------

    public function missingMaterials(): Collection
    {
        $materials = Material::allWithAvailabilities($this->materials, $this, true);
        return $materials
            ->map(function ($material) {
                $availableQuantity = $material->available_quantity;

                $missingQuantity = $material->pivot->quantity - $availableQuantity;
                $missingQuantity = min($missingQuantity, $material->pivot->quantity);
                $material->pivot->quantity_missing = $missingQuantity;

                return $material;
            })
            ->filter(fn($material) => $material->pivot->quantity_missing > 0)
            ->sortBy('name')
            ->values();
    }

    public function syncBeneficiaries(array $beneficiariesIds): static
    {
        if (!$this->is_editable) {
            throw new \LogicException("The beneficiaries of this event cannot be modified.");
        }

        $this->beneficiaries()->sync($beneficiariesIds);
        return $this->refresh();
    }

    public function syncTechnicians(array $techniciansData): static
    {
        if (!$this->is_editable) {
            throw new \LogicException("The technicians of this event cannot be modified.");
        }

        $technicians = new CoreCollection(array_map(
            fn ($technicianData) => (
                new EventTechnician([
                    'event_id' => $this->id,
                    'technician_id' => $technicianData['id'],
                    'start_time' => $technicianData['start_time'],
                    'end_time' => $technicianData['end_time'],
                    'position' => $technicianData['position'],
                ])
            ),
            $techniciansData,
        ));

        return dbTransaction(function () use ($technicians) {
            EventTechnician::flushForEvent($this->id);

            $errors = $technicians
                ->filter(fn ($technician) => !$technician->isValid())
                ->keyBy('technician_id')
                ->map(fn ($technician) => $technician->validationErrors())
                ->all();

            if (!empty($errors)) {
                throw new ValidationException($errors);
            }

            $this->technicians()->saveMany($technicians);
            return $this->refresh();
        });
    }

    public function syncMaterials(array $materialsData): static
    {
        if (!$this->is_editable) {
            throw new \LogicException("The materials of this event cannot be modified.");
        }

        /** @var CoreCollection<int, EventMaterial> $savedEventMaterials */
        $savedEventMaterials = $this->materials()->get()
            ->toBase()
            ->map(fn ($material) => $material->pivot)
            ->keyBy('material_id');

        $data = [];
        foreach ($materialsData as $materialData) {
            if (!array_key_exists('id', $materialData) || !array_key_exists('quantity', $materialData)) {
                throw new \InvalidArgumentException("One or more materials added to the event are invalid.");
            }

            $quantity = (int) $materialData['quantity'];
            if ($quantity <= 0) {
                continue;
            }

            $material = Material::find($materialData['id']);
            if ($material === null) {
                throw new \InvalidArgumentException(
                    "One or more materials added to the event does not exist."
                );
            }

            $savedEventMaterial = $savedEventMaterials->get($materialData['id']);
            $eventMaterialHasReturnData = $savedEventMaterial?->quantity_returned !== null;

            $quantityDeparted = (
                $savedEventMaterial?->quantity_departed !== null
                    ? min($savedEventMaterial->quantity_departed, $quantity)
                    : null
            );

            $quantityReturned = (
                $savedEventMaterial?->quantity_returned !== null
                    ? min($savedEventMaterial->quantity_returned, $quantity)
                    : ($eventMaterialHasReturnData ? 0 : null)
            );

            $quantityReturnedBroken = (
                $savedEventMaterial?->quantity_returned_broken !== null
                    ? min($savedEventMaterial->quantity_returned_broken, $quantity)
                    : ($eventMaterialHasReturnData ? 0 : null)
            );

            $data[$materialData['id']] = [
                'material' => [
                    'quantity' => $quantity,
                    'quantity_departed' => $quantityDeparted,
                    'quantity_returned' => $quantityReturned,
                    'quantity_returned_broken' => $quantityReturnedBroken,
                ],
            ];
        }

        dbTransaction(function () use ($data) {
            $materials = array_combine(array_keys($data), array_column($data, 'material'));
            $this->materials()->sync($materials);
            $this->refresh();
        });

        return $this->refresh();
    }

    public function updateDepartureInventory(array $inventoryData): static
    {
        if ($this->is_archived) {
            throw new \LogicException("This event is archived.");
        }

        // - Si l'inventaire de départ est déjà terminé.
        if ($this->is_departure_inventory_done) {
            throw new \LogicException("This event's departure inventory is already done.");
        }

        // - Si l'inventaire de départ ne peut pas encore être commencé.
        if (!$this->is_departure_inventory_period_open) {
            throw new \LogicException("This event's departure inventory can't be done yet.");
        }

        // - Si la période de réalisation de l'inventaire est dépassée.
        if ($this->is_departure_inventory_period_closed) {
            throw new \LogicException("This event's departure inventory cannot be done anymore.");
        }

        // - Si l'événement ne contient pas de matériel, il n'y a pas d'inventaire à faire.
        if ($this->materials->isEmpty()) {
            throw new \LogicException("This event contains no material, so there can be no inventory.");
        }

        // FIXME: À re-activer lorsque les inventaires de retour terminés
        //        rendront disponibles les stocks utilisés dans l'événement
        //        (en bougeant la date de fin de mobilisation) OU quand la
        //        gestion horaire aura été implémentée.
        //        Sans ça, pour les événements qui partent juste après un autre
        //        dont l'inventaire de retour a été terminé, sur un même jour,
        //        on est bloqué car le système pense qu'il y a une pénurie.
        // // - S'il y a du matériel manquant, on ne peut pas faire l'inventaire de retour.
        // if ($this->has_missing_materials) {
        //     throw new \LogicException("This event contains shortage that should be fixed.");
        // }

        $schema = V::arrayType()->each(new Rule\KeySetStrict(
            new Rule\Key('id'),
            new Rule\Key('actual', V::intVal()->min(0, true)),
            new Rule\Key('comment', V::anyOf(V::nullType(), V::stringType()), false),
        ));
        if (!$schema->validate($inventoryData)) {
            throw new \InvalidArgumentException("Invalid data format.");
        }
        $inventoryData = (new CoreCollection($inventoryData))->keyBy('id');

        $data = [];
        $errors = [];
        foreach ($this->materials as $material) {
            /** @var EventMaterial $eventMaterial */
            $eventMaterial = $material->pivot;
            $addError = function ($message) use ($material, &$errors) {
                $errors[] = ['id' => $material->id, 'message' => __($message)];
            };

            $materialInventory = $inventoryData->get($material->id);
            if ($materialInventory === null) {
                $addError('missing-outgoing-quantity');
                continue;
            }

            // - Quantité effectivement partie.
            $quantityDeparted = (int) $materialInventory['actual'];

            if ($quantityDeparted > $eventMaterial->quantity) {
                $addError('outgoing-quantity-cannot-be-greater-than-planned-quantity');
                continue;
            }

            $data[$material->id] = [
                'material' => [
                    'quantity_departed' => $quantityDeparted,
                    'departure_comment' => $materialInventory['comment'] ?? null,
                ],
            ];
        }

        if (!empty($errors)) {
            $this->refresh();
            throw new ValidationException($errors);
        }

        try {
            dbTransaction(function () use ($data) {
                $materials = array_combine(array_keys($data), array_column($data, 'material'));
                $this->materials()->sync($materials);
                $this->refresh();

                foreach ($this->materials as $material) {
                    $currentData = $data[$material->id] ?? null;
                    if ($currentData === null) {
                        continue;
                    }

                    /** @var EventMaterial $eventMaterial */
                    $eventMaterial = $material->pivot;
                }
            });
        } catch (ValidationException $e) {
            // - Les erreurs de validation sont censées être gérées pour chaque matériel dans le code au-dessus.
            //   On ne peut pas laisser passer des erreurs de validation non formatées.
            throw new \LogicException("Unexpected validation errors occurred while saving the departure inventory.");
        } finally {
            $this->refresh();
        }

        return $this->refresh();
    }

    public function finishDepartureInventory(User $author): static
    {
        if ($this->is_archived) {
            throw new \LogicException("This event is archived.");
        }

        // - Si l'inventaire de départ est déjà terminé.
        if ($this->is_departure_inventory_done) {
            throw new \LogicException("This event's departure inventory is already done.");
        }

        // - Si l'inventaire de départ ne peut pas encore être commencé.
        if (!$this->is_departure_inventory_period_open) {
            throw new \LogicException("This event's departure inventory can't be done yet.");
        }

        // - Si la période de réalisation de l'inventaire est dépassée.
        if ($this->is_departure_inventory_period_closed) {
            throw new \LogicException("This event's departure inventory cannot be done anymore.");
        }

        // - Si l'événement ne contient pas de matériel, il n'y a pas d'inventaire à faire.
        if ($this->materials->isEmpty()) {
            throw new \LogicException("This event contains no material, so there can be no inventory.");
        }

        // FIXME: À re-activer lorsque les inventaires de retour terminés
        //        rendront disponibles les stocks utilisés dans l'événement
        //        (en bougeant la date de fin de mobilisation) OU quand la
        //        gestion horaire aura été implémentée.
        //        Sans ça, pour les événements qui partent juste après un autre
        //        dont l'inventaire de retour a été terminé, sur un même jour,
        //        on est bloqué car le système pense qu'il y a une pénurie.
        // // - S'il y a du matériel manquant, on ne peut pas faire l'inventaire de retour.
        // if ($this->has_missing_materials) {
        //     throw new \LogicException("This event contains shortage that should be fixed.");
        // }

        if (!$this->can_finish_departure_inventory) {
            throw new \LogicException("This event's departure inventory cannot be finished.");
        }

        return dbTransaction(function () use ($author) {
            $this->is_confirmed = true;
            $this->is_departure_inventory_done = true;
            $this->departure_inventory_datetime = Carbon::now()->format('Y-m-d H:i:s');
            $this->departureInventoryAuthor()->associate($author);
            $this->save();

            return $this->refresh();
        });
    }

    public function updateReturnInventory(array $inventoryData): static
    {
        if ($this->is_archived) {
            throw new \LogicException("This event is archived.");
        }

        // - Si l'inventaire de retour est déjà terminé.
        if ($this->is_return_inventory_done) {
            throw new \LogicException("This event's return inventory is already done.");
        }

        // - Si l'inventaire de retour ne peut pas encore être commencé.
        if (!$this->is_return_inventory_period_open) {
            throw new \LogicException("This event's return inventory can't be done yet.");
        }

        // - Si l'événement ne contient pas de matériel, il n'y a pas d'inventaire à faire.
        if ($this->materials->isEmpty()) {
            throw new \LogicException("This event contains no material, so there can be no inventory.");
        }

        // FIXME: À re-activer lorsque les inventaires de retour terminés
        //        rendront disponibles les stocks utilisés dans l'événement
        //        (en bougeant la date de fin de mobilisation) OU quand la
        //        gestion horaire aura été implémentée.
        //        Sans ça, pour les événements qui partent juste après un autre
        //        dont l'inventaire de retour a été terminé, sur un même jour,
        //        on est bloqué car le système pense qu'il y a une pénurie.
        // // - S'il y a du matériel manquant, on ne peut pas faire l'inventaire de retour.
        // if ($this->has_missing_materials) {
        //     throw new \LogicException("This event contains shortage that should be fixed.");
        // }

        $schema = V::arrayType()->each(new Rule\KeySetStrict(
            new Rule\Key('id'),
            new Rule\Key('actual', V::intVal()->min(0, true)),
            new Rule\Key('broken', V::intVal()->min(0, true)),
        ));
        if (!$schema->validate($inventoryData)) {
            throw new \InvalidArgumentException("Invalid data format.");
        }
        $inventoryData = (new CoreCollection($inventoryData))->keyBy('id');

        $data = [];
        $errors = [];
        foreach ($this->materials as $material) {
            /** @var EventMaterial $eventMaterial */
            $eventMaterial = $material->pivot;
            $addError = function ($message) use ($material, &$errors) {
                $errors[] = ['id' => $material->id, 'message' => __($message)];
            };

            $materialInventory = $inventoryData->get($material->id);
            if ($materialInventory === null) {
                $addError('missing-returned-quantity');
                continue;
            }

            // - Quantité effectivement retournée.
            $quantityReturned = (int) $materialInventory['actual'];

            // - Quantité retournée cassée.
            $quantityReturnedBroken = (int) $materialInventory['broken'];

            if ($quantityReturned > $eventMaterial->quantity) {
                $addError('returned-quantity-cannot-be-greater-than-output-quantity');
                continue;
            }

            if ($quantityReturnedBroken > $quantityReturned) {
                $addError('broken-quantity-cannot-be-greater-than-returned-quantity');
                continue;
            }

            $data[$material->id] = [
                'material' => [
                    'quantity_returned' => $quantityReturned,
                    'quantity_returned_broken' => $quantityReturnedBroken,
                ],
            ];
        }

        if (!empty($errors)) {
            $this->refresh();
            throw new ValidationException($errors);
        }

        try {
            dbTransaction(function () use ($data) {
                $materials = array_combine(array_keys($data), array_column($data, 'material'));
                $this->materials()->sync($materials);
                $this->refresh();
            });
        } catch (ValidationException $e) {
            // - Ls erreurs de validation sont censées être gérées pour chaque matériel dans le code au-dessus.
            //   On ne peut pas laisser passer des erreurs de validation non formatées.
            throw new \LogicException("Unexpected validation errors occurred while saving the return inventory.");
        } finally {
            $this->refresh();
        }

        return $this->refresh();
    }

    public function finishReturnInventory(User $author): static
    {
        if ($this->is_archived) {
            throw new \LogicException("This event is archived.");
        }

        // - Si l'inventaire de retour est déjà terminé.
        if ($this->is_return_inventory_done) {
            throw new \LogicException("This event's return inventory is already done.");
        }

        // - Si l'inventaire de retour ne peut pas encore être commencé.
        if (!$this->is_return_inventory_period_open) {
            throw new \LogicException("This event's return inventory can't be done yet.");
        }

        // - Si l'événement ne contient pas de matériel, il n'y a pas d'inventaire à faire.
        if ($this->materials->isEmpty()) {
            throw new \LogicException("This event contains no material, so there can be no inventory.");
        }

        // FIXME: À re-activer lorsque les inventaires de retour terminés
        //        rendront disponibles les stocks utilisés dans l'événement
        //        (en bougeant la date de fin de mobilisation) OU quand la
        //        gestion horaire aura été implémentée.
        //        Sans ça, pour les événements qui partent juste après un autre
        //        dont l'inventaire de retour a été terminé, sur un même jour,
        //        on est bloqué car le système pense qu'il y a une pénurie.
        // // - S'il y a du matériel manquant, on ne peut pas faire l'inventaire de retour.
        // if ($this->has_missing_materials) {
        //     throw new \LogicException("This event contains shortage that should be fixed.");
        // }

        if (!$this->can_finish_return_inventory) {
            throw new \LogicException("This event's return inventory cannot be finished.");
        }

        return dbTransaction(function () use ($author) {
            $this->is_confirmed = true;
            $this->is_return_inventory_done = true;
            $this->return_inventory_datetime = Carbon::now()->format('Y-m-d H:i:s');
            $this->returnInventoryAuthor()->associate($author);
            $this->save();

            // - Met à jour les quantités cassés dans le stock.
            foreach ($this->materials as $material) {
                /** @var EventMaterial $eventMaterial */
                $eventMaterial = $material->pivot;

                if ($eventMaterial->quantity_returned_broken === 0) {
                    continue;
                }

                $material->out_of_order_quantity += $eventMaterial->quantity_returned_broken;
                $material->save();
            }

            return $this->refresh();
        });
    }

    /**
     * Permet de dupliquer un événement.
     *
     * @param array $newEventData Données personnalisées pour le nouvel événement.
     * @param bool $force La duplication doit-elle être forcée si un conflit est rencontré ?
     *                    Si `false` et qu'un conflit est rencontré une exception sera levée.
     * @param User|null $author L'auteur de la duplication.
     *
     * @return static L'instance du nouvel événement
     *
     * @throws ConflictException Si un conflit est rencontré et que `$force` est à `false`.
     */
    public function duplicate(array $newEventData, bool $force = false, ?User $author = null): static
    {
        return dbTransaction(function () use ($newEventData, $author, $force) {
            $newEvent = self::create([
                'title' => $this->title,
                'description' => $this->description,
                'start_date' => $newEventData['start_date'] ?? null,
                'end_date' => $newEventData['end_date'] ?? null,
                'color' => $this->color,
                'is_confirmed' => false,
                'location' => $this->location,
                'is_billable' => $this->is_billable,
                'note' => $this->note,
                'author_id' => $author?->id,
            ]);

            //
            // - Bénéficiaires
            //

            $beneficiaries = $this->beneficiaries->pluck('id')->all();
            $newEvent->syncBeneficiaries($beneficiaries);

            //
            // - Techniciens
            //

            $newEvent->syncTechnicians(array_filter(
                EventTechnician::getForNewDates(
                    $this->technicians,
                    new CarbonImmutable($this->start_date),
                    $newEvent
                ),
                function ($technician) use ($force) {
                    $isAlreadyBusy = EventTechnician::query()
                        ->where('technician_id', $technician['id'])
                        ->where([
                            ['end_time', '>', $technician['start_time']],
                            ['start_time', '<', $technician['end_time']],
                        ])
                        ->whereRelation('event', 'deleted_at', null)
                        ->exists();

                    if ($isAlreadyBusy && !$force) {
                        throw new ConflictException(
                            sprintf('Technician #%d already busy at this time.', $technician['id']),
                            ConflictException::TECHNICIAN_ALREADY_BUSY,
                        );
                    }

                    return !$isAlreadyBusy;
                },
            ));

            //
            // - Matériels
            //

            $materials = $this->materials
                ->map(fn ($material) => [
                    'id' => $material->id,
                    'quantity' => $material->pivot->quantity,
                ])
                ->all();

            $newEvent->syncMaterials($materials);

            return $newEvent->refresh();
        });
    }

    // ------------------------------------------------------
    // -
    // -    Query Scopes
    // -
    // ------------------------------------------------------

    /**
     * @inheritdoc
     */
    public function scopeInPeriod(Builder $query, $start, $end = null): Builder
    {
        if ($start instanceof PeriodInterface) {
            $end = $start->getEndDate();
            $start = $start->getStartDate();
        }

        // - Si pas de date de fin: Période d'une journée.
        $end = $end ?? $start;

        if (!$start instanceof CarbonImmutable) {
            $start = new CarbonImmutable($start);
        }
        if (!$end instanceof CarbonImmutable) {
            $end = new CarbonImmutable($end);
        }

        return $query
            ->orderBy('start_date', 'asc')
            ->where([
                ['end_date', '>=', $start->startOfDay()],
                ['start_date', '<=', $end->setTime(23, 59, 59)],
            ]);
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        $term = trim($term);
        if (strlen($term) < 2) {
            throw new \InvalidArgumentException("The term must contain more than two characters.");
        }

        $term = sprintf('%%%s%%', addcslashes($term, '%_'));
        return $query->where(function (Builder $query) use ($term) {
            $query
                ->orWhere('title', 'LIKE', $term)
                ->orWhere('location', 'LIKE', $term);
        });
    }

    /**
     * @param Builder $query
     * @param Carbon|PeriodInterface $dateOrPeriod
     */
    public function scopeNotReturned(Builder $query, Carbon|PeriodInterface $dateOrPeriod): Builder
    {
        $endDate = $dateOrPeriod;
        $minDate = null;
        if ($dateOrPeriod instanceof PeriodInterface) {
            $endDate = $dateOrPeriod->getEndDate();
            $minDate = $dateOrPeriod->getStartDate();
        }

        $query = $query
            ->where('is_return_inventory_done', false)
            ->where('is_archived', false)
            ->whereHas('materials', function (Builder $subQuery) {
                $subQuery->whereRaw('`quantity` > COALESCE(`quantity_returned`, 0)');
            });

        if ($minDate) {
            $query = $query
                ->whereDate('end_date', '<=', $endDate)
                ->whereDate('end_date', '>', $minDate);
        } else {
            $query = $query->whereDate('end_date', '=', $endDate);
        }

        return $query;
    }

    // ------------------------------------------------------
    // -
    // -    PDF Related
    // -
    // ------------------------------------------------------

    public function toPdf(I18n $i18n, string $sortedBy = 'lists'): Pdf
    {
        $supportedSorts = ['lists', 'parks'];
        if (!in_array($sortedBy, $supportedSorts)) {
            throw new \InvalidArgumentException(vsprintf(
                "Unsupported release sheet sort \"%s\". Valid values are: \"%s\".",
                [$sortedBy, join('", "', $supportedSorts)],
            ));
        }

        $company = Config::get('companyData');

        $pdfName = Str::slugify(implode('-', [
            $i18n->translate('release-sheet'),
            $company['name'],
            $this->title ?: $this->id,
        ]));

        $displayMode = Setting::getWithKey('eventSummary.materialDisplayMode');
        $materials = new MaterialsCollection($this->materials);
        $materialsSorted = new Collection();

        if ($sortedBy === 'lists') {
            $listMaterials = $materials->sortBy('reference', SORT_NATURAL);
            $listMaterials = match ($displayMode) {
                'categories' => $listMaterials->byCategories(),
                'sub-categories' => $listMaterials->bySubCategories(),
                'parks' => $listMaterials->byParks(),
                default => $listMaterials,
            };
            $materialsSorted->put(null, $listMaterials);
        }

        if ($sortedBy === 'parks') {
            $parks = $materials->byParks();
            foreach ($parks as $parkName => $parkMaterials) {
                $materialsSorted->put($parkName, $parkMaterials->sortBy('reference', SORT_NATURAL));
            }
        }

        $technicians = [];
        foreach ($this->technicians as $eventTechnician) {
            $technician = $eventTechnician->technician;

            if (!array_key_exists($technician->id, $technicians)) {
                $technicians[$technician->id] = [
                    'id' => $technician->id,
                    'name' => $technician->full_name,
                    'phone' => $technician->phone,
                    'periods' => [],
                ];
            }

            $startTime = Carbon::createFromFormat('Y-m-d H:i:s', $eventTechnician->start_time);
            $endTime = Carbon::createFromFormat('Y-m-d H:i:s', $eventTechnician->end_time);

            $technicians[$technician->id]['periods'][] = [
                'from' => $startTime,
                'to' => $endTime,
                'position' => $eventTechnician->position,
            ];
        }

        $rawData = (clone $this)
            ->append(['materials', 'beneficiaries', 'technicians'])
            ->toArray();

        return Pdf::createFromTemplate(static::PDF_TEMPLATE, $i18n, $pdfName, [
            'date' => CarbonImmutable::now(),
            'event' => $rawData,
            'beneficiaries' => $this->beneficiaries,
            'company' => Config::get('companyData'),
            'currency' => Config::get('currency.iso'),
            'sortedBy' => $sortedBy,
            'materialsSorted' => $materialsSorted,
            'materialDisplayMode' => $displayMode,
            'replacementAmount' => $this->total_replacement,
            'technicians' => array_values($technicians),
            'totalisableAttributes' => $this->totalisable_attributes,
            'customText' => Setting::getWithKey('eventSummary.customText'),
            'showLegalNumbers' => Setting::getWithKey('eventSummary.showLegalNumbers'),
        ]);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes de "repository"
    // -
    // ------------------------------------------------------

    // TODO => Static.
    public function getAll(bool $withDeleted = false): Builder
    {
        $builder = static::inPeriod(
            'first day of January this year',
            'last day of December this year',
        );

        if ($withDeleted) {
            $builder = $builder->onlyTrashed();
        }

        return $builder;
    }

    public static function staticEdit($id = null, array $data = []): BaseModel
    {
        if ($id && !static::staticExists($id)) {
            throw (new ModelNotFoundException)
                ->setModel(self::class, $id);
        }

        $event = static::firstOrNew(compact('id'));

        $originalStartDate = $event->getOriginal('start_date');
        $originalEndDate = $event->getOriginal('end_date');

        $event->fill($data)->save();

        if (isset($data['beneficiaries'])) {
            if (!is_array($data['beneficiaries'])) {
                throw new \InvalidArgumentException("Key 'beneficiaries' must be an array.");
            }
            $event->syncBeneficiaries($data['beneficiaries']);
        }

        $technicians = null;
        if (isset($data['technicians'])) {
            if (!is_array($data['technicians'])) {
                throw new \InvalidArgumentException("Key 'technicians' must be an array.");
            }
            $technicians = $data['technicians'];
        } elseif (
            // FIXME: Devrait être dans un observer.
            !empty($originalStartDate) &&
            (
                $originalStartDate !== $event->start_date ||
                $originalEndDate !== $event->end_date
            )
        ) {
            $technicians = EventTechnician::getForNewDates(
                $event->technicians,
                new CarbonImmutable($originalStartDate),
                $event,
            );
        }
        if ($technicians) {
            $event->syncTechnicians($technicians);
        }

        if (isset($data['materials'])) {
            if (!is_array($data['materials'])) {
                throw new \InvalidArgumentException("Key 'materials' must be an array.");
            }
            $event->syncMaterials($data['materials']);
        }

        return $event->refresh();
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(string $format = self::SERIALIZE_DEFAULT): array
    {
        /** @var Event $event */
        $event = tap(clone $this, function (Event $event) use ($format) {
            if ($format === self::SERIALIZE_BOOKING_SUMMARY) {
                $event->append([
                    'duration',
                    'technicians',
                    'beneficiaries',
                    'has_missing_materials',
                    'has_not_returned_materials',
                    'parks',
                ]);
            }

            if (in_array($format, [self::SERIALIZE_DETAILS, self::SERIALIZE_BOOKING_DEFAULT], true)) {
                $event->append([
                    'beneficiaries',
                    'technicians',
                    'duration',
                    'total_replacement',
                    'currency',
                    'materials',
                    'has_missing_materials',
                    'departure_inventory_author',
                    'return_inventory_author',
                    'is_return_inventory_started',
                    'has_not_returned_materials',
                    'author',
                ]);

                if ($event->is_billable) {
                    $event->append([
                        'degressive_rate',
                        'vat_rate',
                        'discount_rate',
                        'daily_total_without_discount',
                        'daily_total_discountable',
                        'daily_total_discount',
                        'daily_total_without_taxes',
                        'daily_total_taxes',
                        'daily_total_with_taxes',
                        'total_without_taxes',
                        'total_taxes',
                        'total_with_taxes',
                        'estimates',
                        'invoices',
                    ]);
                }
            }
        });

        $data = new DotArray($event->attributesForSerialization());

        if ($format === self::SERIALIZE_DEFAULT) {
            $data->delete([
                'departure_inventory_datetime',
                'return_inventory_datetime',
            ]);
        }

        if ($format === self::SERIALIZE_BOOKING_SUMMARY) {
            $data->delete([
                'departure_inventory_datetime',
                'return_inventory_datetime',
                'note',
            ]);
        }

        if ($format === self::SERIALIZE_SUMMARY) {
            $data->delete([
                'reference',
                'description',
                'color',
                'is_confirmed',
                'is_billable',
                'is_archived',
                'is_departure_inventory_done',
                'departure_inventory_datetime',
                'is_return_inventory_done',
                'return_inventory_datetime',
                'note',
                'created_at',
                'updated_at',
            ]);
        }

        // - On ajoute manuellement le matériel car on veut les données du pivot avec.
        if ($event->hasAppended('materials')) {
            $data['materials'] = $event->materials
                ->map(fn($material) => (
                    array_merge($material->serialize(), [
                        'pivot' => (
                            (new DotArray($material->pivot->serialize()))
                                ->delete(['id', 'event_id', 'material_id'])
                                ->all()
                        ),
                    ])
                ))
                ->all();
        }

        return $data
            ->delete([
                'author_id',
                'preparer_id',
                'departure_inventory_author_id',
                'return_inventory_author_id',
                'deleted_at',
            ])
            ->all();
    }
}
