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
use Illuminate\Support\Collection as CoreCollection;
use Loxya\Config\Config;
use Loxya\Contracts\Bookable;
use Loxya\Contracts\PeriodInterface;
use Loxya\Contracts\Serializable;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\Traits\Cache;
use Loxya\Models\Traits\Serializer;
use Loxya\Models\Traits\SoftDeletable;
use Loxya\Models\Traits\TransientAttributes;
use Loxya\Services\I18n;
use Loxya\Support\Assert;
use Loxya\Support\Collections\MaterialsCollection;
use Loxya\Support\Pdf;
use Loxya\Support\Period;
use Loxya\Support\Str;
use Respect\Validation\Rules as Rule;
use Respect\Validation\Validator as V;
use Symfony\Contracts\Cache\ItemInterface as CacheItemInterface;

/**
 * Événement.
 *
 * @property-read ?int $id
 * @property string $title
 * @property string|null $reference
 * @property string|null $description
 * @property string|null $location
 * @property string|null $color
 * @property string $operation_start_date
 * @property string $operation_end_date
 * @property bool $operation_is_full_days
 * @property Period $operation_period
 * @property string $mobilization_start_date
 * @property string $mobilization_end_date
 * @property Period $mobilization_period
 * @property-read Decimal|null $degressive_rate
 * @property Decimal|null $discount_rate
 * @property-read Decimal|null $vat_rate
 * @property-read Decimal|null $daily_total
 * @property-read Decimal|null $total_discountable
 * @property-read Decimal|null $total_discount
 * @property-read Decimal|null $total_without_discount
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
 * @property-read bool|null $has_materials_returned_broken
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
 * @property-read Collection<array-key, EventTechnician> $technicians
 * @property-read Collection<array-key, Beneficiary> $beneficiaries
 * @property-read Collection<array-key, Material> $materials
 * @property-read Collection<array-key, Estimate> $estimates
 * @property-read Collection<array-key, Invoice> $invoices
 * @property-read Collection<array-key, Document> $documents
 *
 * @method static Builder|static search(string $term)
 * @method static Builder|static inProgress()
 * @method static Builder|static inPeriod(PeriodInterface $period)
 * @method static Builder|static inPeriod(string|\DateTimeInterface $start, string|\DateTimeInterface|null $end)
 * @method static Builder|static inPeriod(string|\DateTimeInterface|PeriodInterface $start, string|\DateTimeInterface|null $end = null)
 * @method static Builder|static notReturned(PeriodInterface $period)
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
    public const SERIALIZE_SUMMARY = 'summary';
    public const SERIALIZE_DEFAULT = 'default';
    public const SERIALIZE_DETAILS = 'details';
    public const SERIALIZE_BOOKING_EXCERPT = 'booking-excerpt';
    public const SERIALIZE_BOOKING_SUMMARY = 'booking-summary';
    public const SERIALIZE_BOOKING_DEFAULT = 'booking-default';

    /**
     * Cette variable peut être utilisée pour mettre en cache les bookables
     * qui se déroulent en même temps que celui de l'instance courante.
     *
     * @var Collection|(Event)[]
     */
    public ?CoreCollection $__cachedConcurrentBookables = null;

    protected const PDF_TEMPLATE = 'event-summary-default';

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
            'color' => V::optional(V::custom([$this, 'checkColor'])),
            'operation_start_date' => V::custom([$this, 'checkOperationStartDate']),
            'operation_end_date' => V::custom([$this, 'checkOperationEndDate']),
            'operation_is_full_days' => V::boolType(),
            'mobilization_start_date' => V::custom([$this, 'checkMobilizationStartDate']),
            'mobilization_end_date' => V::custom([$this, 'checkMobilizationEndDate']),
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

        $alreadyExists = static::query()
            ->where('reference', $value)
            ->when($this->exists, fn (Builder $subQuery) => (
                $subQuery->where('id', '!=', $this->id)
            ))
            ->withTrashed()
            ->exists();

        return !$alreadyExists ?: 'reference-already-in-use';
    }

    public function checkOperationStartDate($value)
    {
        if (!V::notEmpty()->dateTime()->validate($value)) {
            return false;
        }

        $operationIsFullDays = $this->getAttributeUnsafeValue('operation_is_full_days');
        if (!V::boolType()->validate($operationIsFullDays)) {
            return true;
        }

        $startDate = new CarbonImmutable($value);
        return $operationIsFullDays
            ? $startDate->format('H:i:s') === '00:00:00'
            : $startDate->format('i:s') === '00:00';
    }

    public function checkOperationEndDate($value)
    {
        $dateChecker = V::notEmpty()->dateTime();
        if (!$dateChecker->validate($value)) {
            return false;
        }
        $endDate = new CarbonImmutable($value);

        $operationIsFullDays = $this->getAttributeUnsafeValue('operation_is_full_days');
        if (V::boolType()->validate($operationIsFullDays)) {
            $hasValidTimeFormat = $operationIsFullDays
                ? $endDate->format('H:i:s') === '00:00:00'
                : $endDate->format('i:s') === '00:00';

            if (!$hasValidTimeFormat) {
                return false;
            }
        }

        $startDateRaw = $this->getAttributeUnsafeValue('operation_start_date');
        if (!$dateChecker->validate($startDateRaw)) {
            return true;
        }
        return $endDate->isAfter($startDateRaw) ?: 'end-date-must-be-after-start-date';
    }

    public function checkMobilizationStartDate($value)
    {
        $dateChecker = V::notEmpty()->dateTime();
        if (!$dateChecker->validate($value)) {
            return false;
        }
        $mobilizationStartDate = new CarbonImmutable($value);

        // - La date doit être arrondie au quart d'heure le plus proche.
        if (!$mobilizationStartDate->roundMinutes(15)->eq($mobilizationStartDate)) {
            return 'date-precision-must-be-quarter';
        }

        // - La date de début de mobilisation ne peut pas être après le début de l'événement.
        $operationStartDateRaw = $this->getAttributeUnsafeValue('operation_start_date');
        if (!$dateChecker->validate($operationStartDateRaw)) {
            return true;
        }
        if ($mobilizationStartDate->isAfter($operationStartDateRaw)) {
            return 'mobilization-start-date-must-be-before-event-start-date';
        }

        // - La date de début de mobilisation ne peut pas être après la date d'inventaire de départ (arrondie à 15min).
        $isDepartureInventoryDone = $this->getAttributeUnsafeValue('is_departure_inventory_done');
        if (V::boolType()->validate($isDepartureInventoryDone) && $isDepartureInventoryDone) {
            // - Si l'inventaire de départ était déjà marqué comme effectué et que c'est
            //   toujours le cas, on empêche la modification de la date de début de mobilisation.
            $departureInventoryWasAlreadyDone = $this->getOriginal('is_departure_inventory_done', false);
            if ($this->exists && $departureInventoryWasAlreadyDone && $this->isDirty('mobilization_start_date')) {
                return 'mobilization-start-date-cannot-be-changed-after-departure-inventory';
            }

            $departureInventoryDatetimeRaw = $this->getAttributeUnsafeValue('departure_inventory_datetime');
            if (!$dateChecker->validate($departureInventoryDatetimeRaw)) {
                return true;
            }

            $roundedDepartureInventoryDatetime = CarbonImmutable::parse($departureInventoryDatetimeRaw)
                ->roundMinutes(15, 'ceil');

            return $mobilizationStartDate->lessThanOrEqualTo($roundedDepartureInventoryDatetime) ?: (
                'mobilization-start-date-must-be-before-departure-inventory-date'
            );
        }

        return true;
    }

    public function checkMobilizationEndDate($value)
    {
        $dateChecker = V::notEmpty()->dateTime();
        if (!$dateChecker->validate($value)) {
            return false;
        }
        $mobilizationEndDate = new CarbonImmutable($value);

        // - La date doit être arrondie au quart d'heure le plus proche.
        if (!$mobilizationEndDate->roundMinutes(15)->eq($mobilizationEndDate)) {
            return 'date-precision-must-be-quarter';
        }

        // - La date de fin de mobilisation doit être après la date de début de mobilisation.
        $mobilizationStartDateRaw = $this->getAttributeUnsafeValue('mobilization_start_date');
        if (!$dateChecker->validate($mobilizationStartDateRaw)) {
            return true;
        }
        if (!$mobilizationEndDate->isAfter($mobilizationStartDateRaw)) {
            return 'end-date-must-be-after-start-date';
        }

        // - La date de fin de mobilisation doit être après le début de l'événement.
        $operationStartDateRaw = $this->getAttributeUnsafeValue('operation_start_date');
        if (!$dateChecker->validate($operationStartDateRaw)) {
            return true;
        }
        if (!$mobilizationEndDate->isAfter($operationStartDateRaw)) {
            return 'mobilization-end-date-must-be-after-event-start-date';
        }

        // - La date de fin de mobilisation ne peut pas être après la date d'inventaire de retour (arrondie à 15min).
        $isReturnInventoryDone = $this->getAttributeUnsafeValue('is_return_inventory_done');
        if (V::boolType()->validate($isReturnInventoryDone) && $isReturnInventoryDone) {
            // - Si l'inventaire de retour était déjà marqué comme effectué et que c'est
            //   toujours le cas, on empêche la modification de la date de fin de mobilisation.
            $returnInventoryWasAlreadyDone = $this->getOriginal('is_return_inventory_done', false);
            if ($this->exists && $returnInventoryWasAlreadyDone && $this->isDirty('mobilization_end_date')) {
                return 'mobilization-end-date-cannot-be-changed-after-return-inventory';
            }

            $returnInventoryDatetimeRaw = $this->getAttributeUnsafeValue('return_inventory_datetime');
            if (!$dateChecker->validate($returnInventoryDatetimeRaw)) {
                return true;
            }

            $roundedReturnInventoryDatetime = CarbonImmutable::parse($returnInventoryDatetimeRaw)
                ->roundMinutes(15, 'ceil');

            return $mobilizationEndDate->lessThanOrEqualTo($roundedReturnInventoryDatetime) ?: (
                'mobilization-end-date-must-be-before-return-inventory-date'
            );
        }

        return true;
    }

    public function checkColor($value)
    {
        $colorChecker = V::regex('/^#?[0-9a-f]{6}$/i');
        return $colorChecker->validate($value) ?: 'invalid-hexadecimal-color';
    }

    public function checkIsArchived($value)
    {
        V::boolType()->check($value);

        // - Pas archivé, on s'arrête là.
        if (!$value) {
            return true;
        }

        $mobilizationEndDateRaw = $this->getAttributeUnsafeValue('mobilization_end_date');
        if (!V::dateTime()->validate($mobilizationEndDateRaw)) {
            return true;
        }

        $isReturnInventoryDone = $this->getAttributeUnsafeValue('is_return_inventory_done');
        if (!V::boolType()->validate($isReturnInventoryDone)) {
            return true;
        }

        $isPastAndInventoryDone = (
            Carbon::parse($mobilizationEndDateRaw)->isPast()
            && $isReturnInventoryDone
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

        return User::staticExists($value);
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

        return User::staticExists($value);
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

        return User::staticExists($value);
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
            ->orderBy('start_date');
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
            ->withTrashed()
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
        'color' => 'string',
        'location' => 'string',
        'operation_start_date' => 'string',
        'operation_end_date' => 'string',
        'operation_is_full_days' => 'boolean',
        'mobilization_start_date' => 'string',
        'mobilization_end_date' => 'string',
        'is_confirmed' => 'boolean',
        'is_archived' => 'boolean',
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

    public function getMobilizationPeriodAttribute(): Period
    {
        return new Period(
            $this->mobilization_start_date,
            $this->mobilization_end_date,
        );
    }

    public function getOperationPeriodAttribute(): Period
    {
        return new Period(
            $this->operation_start_date,
            $this->operation_end_date,
            $this->operation_is_full_days,
        );
    }

    public function getDegressiveRateAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        $durationDays = $this->operation_period->asDays();

        $result = null;
        $jsFunction = Config::get('degressiveRateFunction');
        if (!empty($jsFunction) && str_contains($jsFunction, 'daysCount')) {
            $function = preg_replace('/daysCount/', (string) $durationDays, $jsFunction);
            eval(sprintf('$result = %s;', $function)); // phpcs:ignore Squiz.PHP.Eval
        }

        return Decimal::of($result && is_numeric($result) ? $result : $durationDays)
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
        return $this->materials
            ->reduce(
                static function (CoreCollection $parkIds, Material $material) {
                    $parkIds[] = $material->park_id;
                    return $parkIds;
                },
                new CoreCollection(),
            )
            ->unique()
            ->sort(SORT_NUMERIC)
            ->values()
            ->all();
    }

    public function getCategoriesAttribute()
    {
        return $this->materials
            ->pluck('category_id')
            ->filter(static fn ($categoryId) => $categoryId !== null)
            ->unique()
            ->sort(SORT_NUMERIC)
            ->values()
            ->all();
    }

    public function getTotalisableAttributesAttribute(): array
    {
        return $this->materials->reduce(
            static function ($totals, $material) {
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
    // - Daily total.
    //

    public function getDailyTotalAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->materials->pluck('pivot')
            ->reduce(
                static fn (Decimal $currentTotal, EventMaterial $material) => (
                    $currentTotal->plus($material->total_price)
                ),
                Decimal::zero(),
            )
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    //
    // - Discount.
    //

    public function getTotalWithoutDiscountAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->daily_total
            ->multipliedBy($this->degressive_rate)
            // @see https://www.ibm.com/docs/en/order-management-sw/9.2.1?topic=rounding-price
            // @see https://wiki.dolibarr.org/index.php?title=VAT_setup,_calculation_and_rounding_rules
            ->toScale(2, RoundingMode::HALF_UP);
    }

    public function getTotalDiscountableAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->materials->pluck('pivot')
            ->reduce(
                static fn (Decimal $currentTotal, EventMaterial $material) => (
                    $material->is_discountable
                        ? $currentTotal->plus($material->total_price)
                        : $currentTotal
                ),
                Decimal::zero(),
            )
            ->multipliedBy($this->degressive_rate)
            ->toScale(2, RoundingMode::HALF_UP);
    }

    public function getTotalDiscountAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->total_without_discount
            ->multipliedBy($this->discount_rate->dividedBy(100, 6))
            // @see https://www.ibm.com/docs/en/order-management-sw/9.2.1?topic=rounding-price
            // @see https://wiki.dolibarr.org/index.php?title=VAT_setup,_calculation_and_rounding_rules
            ->toScale(2, RoundingMode::HALF_UP);
    }

    //
    // - Totals.
    //

    public function getTotalWithoutTaxesAttribute(): ?Decimal
    {
        if (!$this->is_billable) {
            return null;
        }

        return $this->total_without_discount
            ->minus($this->total_discount)
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

    public function getTotalReplacementAttribute(): Decimal
    {
        return $this->materials->pluck('pivot')
            ->reduce(
                static fn (Decimal $currentTotal, EventMaterial $material) => (
                    $currentTotal->plus($material->total_replacement_price)
                ),
                Decimal::zero(),
            )
            ->toScale(2, RoundingMode::UNNECESSARY);
    }

    //
    // - Booleans
    //

    public function getHasMissingMaterialsAttribute(): ?bool
    {
        if (!$this->exists || $this->is_archived) {
            return null;
        }

        // - Si l'événement est passé ET que l'inventaire de retour est fait,
        //   la disponibilité du matériel n'est pas calculée.
        if ($this->mobilization_period->getEndDate()->isPast() && $this->is_return_inventory_done) {
            return null;
        }

        return $this->cacheGet(
            'has_missing_materials',
            function (?CacheItemInterface $cacheItem) {
                if ($cacheItem) {
                    $cacheItem->expiresAfter(new \DateInterval('P1D'));
                }
                return $this->missingMaterials()->isNotEmpty();
            },
        );
    }

    public function getIsDepartureInventoryPeriodOpenAttribute(): bool
    {
        // - 30 jours avant le début de mobilisation prévu.
        // TODO: Permettre de configurer ça à l'avenir ?
        return $this->mobilization_period->getStartDate()
            ->subDays(30)
            ->isPast();
    }

    public function getIsDepartureInventoryPeriodClosedAttribute(): bool
    {
        // - Si l'inventaire de retour est fait, la période de réalisation
        //   des inventaires de départ est forcément fermée.
        if ($this->is_return_inventory_done) {
            return true;
        }

        // NOTE: On laisse un délai de 1 jour après la date de début de mobilisation
        //       pour faire l'inventaire de départ (mais en ne dépassant jamais la date
        //       de fin de mobilisation).
        $inventoryPeriodCloseDate = $this->mobilization_period->getStartDate()->addDay();
        if ($inventoryPeriodCloseDate->isAfter($this->mobilization_period->getEndDate())) {
            $inventoryPeriodCloseDate = $this->mobilization_period->getEndDate();
        }

        return $inventoryPeriodCloseDate->isPast();
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

        if ($this->materials->isEmpty() || $this->has_missing_materials) {
            return false;
        }

        return $this->materials->every(
            static fn ($material) => $material->pivot->is_departure_inventory_filled,
        );
    }

    public function getIsReturnInventoryPeriodOpenAttribute(): bool
    {
        // NOTE: C'est la date de début d'événement qui fait foi pour permettre
        //       le retour, pas la date de début de mobilisation.
        //       (sans quoi on pourrait faire le retour d'un événement avant même
        //       qu'il ait réellement commencé, ce qui n'a pas de sens).
        return $this->operation_period->getStartDate()->isPast();
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

        if ($this->materials->isEmpty() || $this->has_missing_materials) {
            return false;
        }

        return $this->materials->every(
            static fn ($material) => $material->pivot->is_return_inventory_filled,
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

    public function getHasNotReturnedMaterialsAttribute(): ?bool
    {
        // - Pas de calcul pour les événements archivés (ou pas encore persisté).
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

                return $this->materials->some(static fn ($material) => (
                    ($material->pivot->quantity - ($material->pivot->quantity_returned ?? 0)) > 0
                ));
            },
        );
    }

    public function getHasMaterialsReturnedBrokenAttribute(): ?bool
    {
        // - Pas de calcul pour les événements archivés (ou pas encore persisté).
        if (!$this->exists || $this->is_archived) {
            return null;
        }

        // - Si l'inventaire n'a pas encore été effectué, on a pas l'information.
        if (!$this->is_return_inventory_done) {
            return null;
        }

        // - S'il n'y a pas de material dans l'événement, il ne peut pas y
        //   avoir de matériel retourné cassé.
        if ($this->materials->isEmpty()) {
            return false;
        }

        return $this->materials->some(static fn ($material) => (
            ($material->pivot->quantity_returned_broken ?? 0) > 0
        ));
    }

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getStartDate(): CarbonImmutable
    {
        return $this->mobilization_period->getStartDate();
    }

    public function getEndDate(): CarbonImmutable
    {
        return $this->mobilization_period->getEndDate();
    }

    public function overlaps(PeriodInterface $period): bool
    {
        return $this->mobilization_period->overlaps($period);
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
        'operation_start_date',
        'operation_end_date',
        'operation_is_full_days',
        'operation_period',
        'mobilization_start_date',
        'mobilization_end_date',
        'mobilization_period',
        'color',
        'is_confirmed',
        'location',
        'is_billable',
        'note',
        'author_id',
    ];

    public function setOperationPeriodAttribute(mixed $rawPeriod): void
    {
        $period = Period::tryFrom($rawPeriod);

        $this->operation_start_date = $period?->getStartDate()->format('Y-m-d H:i:s');
        $this->operation_end_date = $period?->getEndDate()->format('Y-m-d H:i:s');
        $this->operation_is_full_days = $period?->isFullDays() ?? false;
    }

    public function setMobilizationPeriodAttribute(mixed $rawPeriod): void
    {
        $period = Period::tryFrom($rawPeriod);

        $this->mobilization_start_date = $period?->getStartDate()->format('Y-m-d H:i:s');
        $this->mobilization_end_date = $period?->getEndDate()->format('Y-m-d H:i:s');
    }

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
            ->map(static function ($material) {
                $availableQuantity = $material->available_quantity;

                $missingQuantity = $material->pivot->quantity - $availableQuantity;
                $missingQuantity = min($missingQuantity, $material->pivot->quantity);
                $material->pivot->quantity_missing = $missingQuantity;

                return $material;
            })
            ->filter(static fn ($material) => $material->pivot->quantity_missing > 0)
            ->sortBy('name')
            ->values();
    }

    public function syncBeneficiaries(array $beneficiariesIds): static
    {
        $this->beneficiaries()->sync($beneficiariesIds);
        return $this->refresh();
    }

    public function syncTechnicians(array $techniciansData): static
    {
        $schema = V::arrayType()->each(new Rule\KeySetStrict(
            new Rule\Key('id'),
            new Rule\Key('position'),
            new Rule\Key('period'),
        ));
        if (!$schema->validate($techniciansData)) {
            throw new \InvalidArgumentException("Invalid data format.");
        }

        $technicians = new CoreCollection(array_map(
            fn ($technicianData) => (
                new EventTechnician([
                    'event_id' => $this->id,
                    'technician_id' => $technicianData['id'],
                    'position' => $technicianData['position'],
                    'period' => $technicianData['period'],
                ])
            ),
            $techniciansData,
        ));

        return dbTransaction(function () use ($technicians) {
            EventTechnician::flushForEvent($this->id);

            $errors = $technicians
                ->filter(static fn ($technician) => !$technician->isValid())
                ->keyBy('technician_id')
                ->map(static fn ($technician) => $technician->validationErrors())
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
        /** @var CoreCollection<int, EventMaterial> $savedEventMaterials */
        $savedEventMaterials = $this->materials()->get()
            ->toBase()
            ->map(static fn ($material) => $material->pivot)
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
                    "One or more materials (or units of them) added to the event does not exist.",
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

        // - S'il y a du matériel manquant, on ne peut pas faire l'inventaire de retour.
        if ($this->has_missing_materials) {
            throw new \LogicException("This event contains shortage that should be fixed.");
        }

        $schema = V::arrayType()->each(new Rule\KeySetStrict(
            new Rule\Key('id'),
            new Rule\Key('actual', V::intVal()->min(0)),
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
            $addError = static function ($message) use ($material, &$errors) {
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
            });
        } catch (ValidationException) {
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

        // - S'il y a du matériel manquant, on ne peut pas faire l'inventaire de retour.
        if ($this->has_missing_materials) {
            throw new \LogicException("This event contains shortage that should be fixed.");
        }

        if (!$this->can_finish_departure_inventory) {
            throw new \LogicException("This event's departure inventory cannot be finished.");
        }

        return dbTransaction(function () use ($author) {
            $this->is_confirmed = true;
            $this->is_departure_inventory_done = true;

            $departureInventoryDate = CarbonImmutable::now();
            $this->departure_inventory_datetime = (
                $departureInventoryDate->format('Y-m-d H:i:s')
            );

            // - On déplace la date de début de mobilisation si l'inventaire de départ
            //   est réalisé avant la date de début de mobilisation prévue.
            $roundedDepartureInventoryDate = $departureInventoryDate->roundMinutes(15, 'ceil');
            $shouldMoveMobilizationStartDate = (
                $roundedDepartureInventoryDate->isBefore($this->mobilization_start_date)
            );
            if ($shouldMoveMobilizationStartDate) {
                // Note: On ne décale pas pour autant les assignations technicien car
                //       ce n'est pas parce que l'inventaire de départ a été fait avant
                //       que cela remet en cause la planification initialement prévue.
                //       => S'ils veulent modifier ça ils iront donc à l'étape de
                //          planification des techniciens dans l'edition de l'événement)
                $this->mobilization_start_date = (
                    $roundedDepartureInventoryDate->format('Y-m-d H:i:s')
                );
            }

            $this->departureInventoryAuthor()->associate($author);
            $this->save();

            return $this->refresh();
        });
    }

    public function cancelDepartureInventory()
    {
        if ($this->is_archived) {
            throw new \LogicException("This event is archived.");
        }

        // - Si l'inventaire de départ n'est pas terminé, il n'y a rien à annuler.
        if (!$this->is_departure_inventory_done) {
            throw new \LogicException("This event's departure inventory is not done.");
        }

        // - Si l'inventaire de retour est déjà terminé, on ne peut plus annuler l'inventaire de départ.
        if ($this->is_return_inventory_done) {
            throw new \LogicException(
                "This event's return inventory is already done, the departure " .
                "inventory can no longer be cancelled.",
            );
        }

        // - Si le début de l'événement est dans le passé, on ne peut plus annuler l'inventaire de départ.
        if ($this->operation_period->getStartDate()->isPast()) {
            throw new \LogicException(
                "This event has already started, the departure inventory can no " .
                "longer be cancelled.",
            );
        }

        return dbTransaction(function () {
            $this->is_departure_inventory_done = false;
            $this->departure_inventory_author_id = null;
            $this->departure_inventory_datetime = null;

            // - Si la période de réalisation de l'inventaire de départ est terminée mais que la date
            //   de début d'opération est dans le futur, on reset la date de début de mobilisation.
            $shouldMoveMobilizationStartDate = (
                $this->is_departure_inventory_period_closed &&
                $this->operation_period->getStartDate()->isFuture()
            );
            if ($shouldMoveMobilizationStartDate) {
                $this->mobilization_start_date = $this->operation_start_date;
            }

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

        // - S'il y a du matériel manquant, on ne peut pas faire l'inventaire de retour.
        if ($this->has_missing_materials) {
            throw new \LogicException("This event contains shortage that should be fixed.");
        }

        $schema = V::arrayType()->each(new Rule\KeySetStrict(
            new Rule\Key('id'),
            new Rule\Key('actual', V::intVal()->min(0)),
            new Rule\Key('broken', V::intVal()->min(0)),
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
            $addError = static function ($message) use ($material, &$errors) {
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
        } catch (ValidationException) {
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

        // - S'il y a du matériel manquant, on ne peut pas faire l'inventaire de retour.
        if ($this->has_missing_materials) {
            throw new \LogicException("This event contains shortage that should be fixed.");
        }

        if (!$this->can_finish_return_inventory) {
            throw new \LogicException("This event's return inventory cannot be finished.");
        }

        return dbTransaction(function () use ($author) {
            $this->is_confirmed = true;
            $this->is_return_inventory_done = true;

            $returnInventoryDate = CarbonImmutable::now();
            $this->return_inventory_datetime = (
                $returnInventoryDate->format('Y-m-d H:i:s')
            );

            // - On déplace la date de fin de mobilisation si l'inventaire de retour
            //   est réalisé avant la date de fin de mobilisation prévue.
            $roundedReturnInventoryDate = $returnInventoryDate->roundMinutes(15, 'ceil');
            $shouldMoveMobilizationEndDate = (
                $roundedReturnInventoryDate->isBefore($this->mobilization_end_date)
            );
            if ($shouldMoveMobilizationEndDate) {
                $this->mobilization_end_date = (
                    $roundedReturnInventoryDate->format('Y-m-d H:i:s')
                );
            }

            $this->returnInventoryAuthor()->associate($author);
            $this->save();

            // NOTE: À ne pas remonter avant le `$this->save()` car contient un `$this->refresh()`
            //       qui ferait un reset sur les données actuellement en cours d'edition.
            if ($shouldMoveMobilizationEndDate) {
                $assignationPeriod = $this->mobilization_period->merge($this->operation_period);
                $this->syncTechnicians($this->technicians->reduce(
                    static function ($assignments, $oldAssignment) use ($assignationPeriod) {
                        $newPeriod = $oldAssignment->computeNewPeriod($assignationPeriod);
                        if ($newPeriod !== null) {
                            $assignments[] = [
                                'id' => $oldAssignment->technician_id,
                                'position' => $oldAssignment->position,
                                'period' => $newPeriod,
                            ];
                        }
                        return $assignments;
                    },
                    [],
                ));
            }

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

    public function cancelReturnInventory()
    {
        if ($this->is_archived) {
            throw new \LogicException("This event is archived.");
        }

        // - Si l'inventaire de retour n'est pas terminé, il n'y a rien à annuler.
        if (!$this->is_return_inventory_done) {
            throw new \LogicException("This event's return inventory is not done.");
        }

        // - S'il n'y a pas de matériel cassé, on permet l'annulation de
        //   l'inventaire quelque soit le moment ou il a été terminé.
        //   Sinon, l'inventaire est annulable pendant 1 semaine après
        //   l'avoir marqué comme terminé.
        if ($this->has_materials_returned_broken) {
            $isCancellable = (
                $this->return_inventory_datetime !== null &&
                CarbonImmutable::parse($this->return_inventory_datetime)
                    ->isAfter(Carbon::now()->subWeek())
            );
            if (!$isCancellable) {
                throw new \LogicException(
                    "This event's return inventory can no longer been cancelled.",
                );
            }
        }

        return dbTransaction(function () {
            // - On annule l'inventaire lui-même.
            $this->is_return_inventory_done = false;
            $this->return_inventory_author_id = null;
            $this->return_inventory_datetime = null;
            $this->save();

            // - Met à jour les quantités cassés dans le stock.
            foreach ($this->materials as $material) {
                /** @var EventMaterial $eventMaterial */
                $eventMaterial = $material->pivot;

                if ($eventMaterial->quantity_returned_broken === 0) {
                    continue;
                }

                $material->out_of_order_quantity = max(0, (
                    $material->out_of_order_quantity - $eventMaterial->quantity_returned_broken
                ));
                $material->save();
            }

            return $this->refresh();
        });
    }

    /**
     * Permet de dupliquer un événement.
     *
     * @param array $newEventData Données personnalisées pour le nouvel événement.
     * @param User|null $author L'auteur de la duplication.
     *
     * @return static L'instance du nouvel événement.
     */
    public function duplicate(array $newEventData, ?User $author = null): static
    {
        return dbTransaction(function () use ($newEventData, $author) {
            $newEvent = self::create([
                'title' => $this->title,
                'description' => $this->description,
                'color' => $this->color,
                'operation_period' => $newEventData['operation_period'] ?? null,
                'mobilization_period' => $newEventData['mobilization_period'] ?? null,
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
            // - Matériels
            //

            $materials = $this->materials
                ->map(static fn ($material) => [
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

    public function scopeInProgress(Builder $query): Builder
    {
        $now = CarbonImmutable::now();

        return $query
            ->orderBy('mobilization_start_date', 'asc')
            ->where([
                ['mobilization_start_date', '<=', $now],
                ['mobilization_end_date', '>', $now],
            ]);
    }

    /**
     * @param Builder $query
     * @param string|\DateTimeInterface|PeriodInterface $start
     * @param string|\DateTimeInterface|null $end (optional)
     */
    public function scopeInPeriod(Builder $query, $start, $end = null): Builder
    {
        if ($start instanceof PeriodInterface) {
            $end = $start->getEndDate();
            $start = $start->getStartDate();
        }

        // - Si pas de date de fin: Période de 24 heures.
        $start = new CarbonImmutable($start);
        $end = new CarbonImmutable($end ?? $start->addDay());

        return $query
            ->orderBy('mobilization_start_date', 'asc')
            ->where([
                ['mobilization_start_date', '<', $end],
                ['mobilization_end_date', '>', $start],
            ]);
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        Assert::minLength($term, 2, "The term must contain more than two characters.");

        $safeTerm = sprintf('%%%s%%', addcslashes($term, '%_'));
        return $query->where(static fn (Builder $subQuery) => (
            $subQuery
                ->orWhere('title', 'LIKE', $safeTerm)
                ->orWhere('location', 'LIKE', $safeTerm)
                ->orWhereHas('beneficiaries', static fn (Builder $beneficiariesQuery) => (
                    // - Ici on passe `$term` et non `$safeTerm`, car `Beneficiary::search()`
                    //   se chargera de l'échappement.
                    $beneficiariesQuery->search($term)
                ))
        ));
    }

    public function scopeNotReturned(Builder $query, PeriodInterface $period): Builder
    {
        return $query
            ->where('is_archived', false)
            ->where('is_return_inventory_done', false)
            ->where([
                ['mobilization_end_date', '>', $period->getStartDate()],
                ['mobilization_end_date', '<=', $period->getEndDate()],
            ])
            ->whereHas('materials', static function (Builder $subQuery) {
                $subQuery->whereRaw('`quantity` > COALESCE(`quantity_returned`, 0)');
            });
    }

    public function scopeEndingToday(Builder $query): Builder
    {
        return $query
            ->where('mobilization_end_date', '>', Carbon::today()->startOfDay())
            ->where('mobilization_end_date', '<=', Carbon::tomorrow()->startOfDay());
    }

    public function scopeReturnInventoryTodo(Builder $query): Builder
    {
        return $query
            ->where('mobilization_end_date', '<=', Carbon::now())
            ->where('is_return_inventory_done', false);
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
                    'assignments' => [],
                ];
            }

            $technicians[$technician->id]['assignments'][] = [
                'period' => $eventTechnician->period,
                'position' => $eventTechnician->position,
            ];
        }

        return Pdf::createFromTemplate(static::PDF_TEMPLATE, $i18n, $pdfName, [
            'date' => CarbonImmutable::now(),
            'event' => $this,
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
            'showReplacementPrices' => Setting::getWithKey('eventSummary.showReplacementPrices'),
            'showDescriptions' => Setting::getWithKey('eventSummary.showDescriptions'),
            'showTags' => Setting::getWithKey('eventSummary.showTags'),
            'showPictures' => Setting::getWithKey('eventSummary.showPictures'),
        ]);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes de "repository"
    // -
    // ------------------------------------------------------

    public static function staticEdit($id = null, array $data = []): static
    {
        $oldOperationPeriod = null;
        $oldMobilizationPeriod = null;
        if ($id !== null) {
            $existingEvent = static::findOrFail($id);
            $oldOperationPeriod = $existingEvent->operation_period;
            $oldMobilizationPeriod = $existingEvent->mobilization_period;
        }

        $event = $existingEvent ?? new static();
        $event->fill($data)->save();

        // - Bénéficiaires.
        if (isset($data['beneficiaries'])) {
            Assert::isArray($data['beneficiaries'], "Key `beneficiaries` must be an array.");
            $event->syncBeneficiaries($data['beneficiaries']);
        }

        // - Techniciens.
        $technicians = null;
        if (isset($data['technicians'])) {
            Assert::isArray($data['technicians'], "Key `technicians` must be an array.");
            $technicians = $data['technicians'];
        } elseif (
            !($oldOperationPeriod?->isSame($event->operation_period) ?? true) ||
            !($oldMobilizationPeriod?->isSame($event->mobilization_period) ?? true)
        ) {
            $assignationPeriod = $event->mobilization_period->merge($event->operation_period);
            $technicians = $event->technicians->reduce(
                static function ($assignments, $oldAssignment) use ($assignationPeriod) {
                    $newPeriod = $oldAssignment->computeNewPeriod($assignationPeriod);
                    if ($newPeriod !== null) {
                        $assignments[] = [
                            'id' => $oldAssignment->technician_id,
                            'position' => $oldAssignment->position,
                            'period' => $newPeriod,
                        ];
                    }
                    return $assignments;
                },
                [],
            );
        }
        if ($technicians !== null) {
            $event->syncTechnicians($technicians);
        }

        // - Matériels.
        if (isset($data['materials'])) {
            Assert::isArray($data['materials'], "Key `materials` must be an array.");
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
        $event = tap(clone $this, static function (Event $event) use ($format) {
            $event->append(['operation_period', 'mobilization_period']);

            switch ($format) {
                case self::SERIALIZE_DETAILS:
                    $event->append([
                        'beneficiaries',
                        'technicians',
                        'has_not_returned_materials',
                        'total_replacement',
                        'currency',
                        'has_missing_materials',
                        'departure_inventory_author',
                        'return_inventory_author',
                        'is_return_inventory_started',
                        'author',
                    ]);

                    if ($event->is_billable) {
                        $event->append([
                            'degressive_rate',
                            'vat_rate',
                            'discount_rate',
                            'daily_total',
                            'total_without_discount',
                            'total_discountable',
                            'total_discount',
                            'total_without_taxes',
                            'total_taxes',
                            'total_with_taxes',
                            'estimates',
                            'invoices',
                        ]);
                    }
                    break;

                case self::SERIALIZE_BOOKING_EXCERPT:
                    $event->append([
                        'beneficiaries',
                        'technicians',
                        'has_not_returned_materials',
                        'categories',
                        'parks',
                    ]);
                    break;

                case self::SERIALIZE_BOOKING_SUMMARY:
                    $event->append([
                        'beneficiaries',
                        'technicians',
                        'has_not_returned_materials',
                        'has_missing_materials',
                        'categories',
                        'parks',
                    ]);
                    break;

                case self::SERIALIZE_BOOKING_DEFAULT:
                    $event->append([
                        'beneficiaries',
                        'technicians',
                        'has_not_returned_materials',
                        'total_replacement',
                        'currency',
                        'has_missing_materials',
                        'departure_inventory_author',
                        'return_inventory_author',
                        'is_return_inventory_started',
                        'author',
                    ]);

                    if ($event->is_billable) {
                        $event->append([
                            'degressive_rate',
                            'vat_rate',
                            'discount_rate',
                            'daily_total',
                            'total_without_discount',
                            'total_discountable',
                            'total_discount',
                            'total_without_taxes',
                            'total_taxes',
                            'total_with_taxes',
                            'estimates',
                            'invoices',
                        ]);
                    }
                    break;
            }
        });

        $data = new DotArray($event->attributesForSerialization());

        switch ($format) {
            case self::SERIALIZE_SUMMARY:
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
                break;

            case self::SERIALIZE_DEFAULT:
                $data->delete([
                    'departure_inventory_datetime',
                    'return_inventory_datetime',
                ]);
                break;

            case self::SERIALIZE_BOOKING_EXCERPT:
                $data
                    ->set('entity', static::TYPE)
                    ->delete([
                        'reference',
                        'description',
                        'is_billable',
                        'departure_inventory_datetime',
                        'return_inventory_datetime',
                        'note',
                        'updated_at',
                    ]);
                break;

            case self::SERIALIZE_BOOKING_SUMMARY:
                $data
                    ->set('entity', static::TYPE)
                    ->delete([
                        'departure_inventory_datetime',
                        'return_inventory_datetime',
                        'note',
                        'updated_at',
                    ]);
                break;

            case self::SERIALIZE_BOOKING_DEFAULT:
                $data->set('entity', static::TYPE);
                break;
        }

        $formatsWithMaterials = [
            self::SERIALIZE_DETAILS,
            self::SERIALIZE_BOOKING_DEFAULT,
        ];
        if (in_array($format, $formatsWithMaterials, true)) {
            $data['materials'] = $event->materials
                ->map(static fn ($material) => (
                    array_merge($material->serialize(), [
                        'pivot' => $material->pivot->serialize(),
                    ])
                ))
                ->all();
        }

        return $data
            ->delete([
                'preparer_id',
                'author_id',
                'operation_start_date',
                'operation_end_date',
                'operation_is_full_days',
                'mobilization_start_date',
                'mobilization_end_date',
                'departure_inventory_author_id',
                'return_inventory_author_id',
                'deleted_at',
            ])
            ->all();
    }

    public static function serializeValidation(array $data): array
    {
        $data = new DotArray($data);

        // - Période de mobilization.
        $mobilizationPeriodErrors = array_unique(array_merge(
            $data->get('mobilization_start_date', []),
            $data->get('mobilization_end_date', []),
        ));
        if (!empty($mobilizationPeriodErrors)) {
            $data->set('mobilization_period', $mobilizationPeriodErrors);
        }
        $data->delete('mobilization_start_date');
        $data->delete('mobilization_end_date');

        // - Période d'opération.
        $operationPeriodErrors = array_unique(array_merge(
            $data->get('operation_start_date', []),
            $data->get('operation_end_date', []),
        ));
        if (!empty($operationPeriodErrors)) {
            $data->set('operation_period', $operationPeriodErrors);
        }
        $data->delete('operation_start_date');
        $data->delete('operation_end_date');

        return $data->all();
    }
}
