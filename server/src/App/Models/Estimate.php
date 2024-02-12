<?php
declare(strict_types=1);

namespace Loxya\Models;

use Brick\Math\BigDecimal as Decimal;
use Brick\Math\RoundingMode;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Respect\Validation\Validator as V;
use Loxya\Config\Config;
use Loxya\Contracts\Serializable;
use Loxya\Models\Casts\AsDecimal;
use Loxya\Models\Traits\Pdfable;
use Loxya\Models\Traits\Serializer;
use Loxya\Models\Traits\SoftDeletable;
use Loxya\Services\I18n;
use Loxya\Support\Arr;
use Loxya\Support\Collections\MaterialsCollection;
use Loxya\Support\FullDuration;
use Loxya\Support\Period;
use Loxya\Support\Str;

/**
 * Devis.
 *
 * @property-read ?int $id
 * @property CarbonImmutable $date
 * @property-read ?string $url
 * @property string $booking_type
 * @property int $booking_id
 * @property-read Event $booking
 * @property string|null $booking_title
 * @property-read FullDuration $booking_duration
 * @property CarbonImmutable $booking_start_date
 * @property CarbonImmutable $booking_end_date
 * @property-read string|null $booking_location
 * @property int $beneficiary_id
 * @property-read Beneficiary $beneficiary
 * @property Decimal $degressive_rate
 * @property Decimal $discount_rate
 * @property Decimal $vat_rate
 * @property Decimal $daily_total
 * @property Decimal $total_without_discount
 * @property Decimal $total_discountable
 * @property Decimal $total_discount
 * @property Decimal $total_without_taxes
 * @property Decimal $total_taxes
 * @property Decimal $total_with_taxes
 * @property Decimal $total_replacement
 * @property string $currency
 * @property int|null $author_id
 * @property-read User|null $author
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
 * @property-read CarbonImmutable|null $deleted_at
 *
 * @property-read Collection|EstimateMaterial[] $materials
 */
final class Estimate extends BaseModel implements Serializable
{
    use Pdfable;
    use Serializer;
    use SoftDeletable;

    protected const PDF_TEMPLATE = 'estimate-default';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'date' => V::notEmpty()->dateTime(),
            'booking_type' => V::notEmpty()->anyOf(
                V::equals(Event::TYPE),
            ),
            'booking_id' => V::custom([$this, 'checkBookingId']),
            'booking_title' => V::optional(V::length(2, 191)),
            'booking_start_date' => V::dateTime(),
            'booking_end_date' => V::custom([$this, 'checkBookingEndDate']),
            'beneficiary_id' => V::custom([$this, 'checkBeneficiaryId']),
            'degressive_rate' => V::custom([$this, 'checkDegressiveRate']),
            'discount_rate' => V::custom([$this, 'checkDiscountRate']),
            'vat_rate' => V::custom([$this, 'checkVatRate']),
            'daily_total' => V::custom([$this, 'checkAmount']),
            'total_without_discount' => V::custom([$this, 'checkAmount']),
            'total_discountable' => V::custom([$this, 'checkAmount']),
            'total_discount' => V::custom([$this, 'checkAmount']),
            'total_without_taxes' => V::custom([$this, 'checkAmount']),
            'total_taxes' => V::custom([$this, 'checkAmount']),
            'total_with_taxes' => V::custom([$this, 'checkAmount']),
            'total_replacement' => V::custom([$this, 'checkAmount']),
            'currency' => V::notEmpty()->allOf(V::uppercase(), V::length(3, 3)),
            'author_id' => V::custom([$this, 'checkAuthorId']),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkBookingId($value)
    {
        V::notEmpty()->numericVal()->check($value);

        return match ($this->booking_type) {
            Event::TYPE => Event::staticExists($value),
            default => false, // - Type inconnu.
        };
    }

    public function checkBookingEndDate($value)
    {
        $dateChecker = V::notEmpty()->dateTime();
        if (!$dateChecker->validate($value)) {
            return 'invalid-date';
        }

        if (!$dateChecker->validate($this->getAttributeFromArray('booking_start_date'))) {
            return true;
        }

        $startDate = new Carbon($this->getAttributeFromArray('booking_start_date'));
        $endDate = new Carbon($this->getAttributeFromArray('booking_end_date'));

        return $startDate <= $endDate ?: 'end-date-must-be-later';
    }

    public function checkBeneficiaryId($value)
    {
        V::notEmpty()->numericVal()->check($value);

        $beneficiary = Beneficiary::find($value);
        if (!$beneficiary) {
            return false;
        }

        return !$this->exists || $this->isDirty('company_id')
            ? !$beneficiary->trashed()
            : true;
    }

    public function checkDegressiveRate($value)
    {
        V::floatVal()->check($value);
        $value = Decimal::of($value);

        return (
            $value->isGreaterThanOrEqualTo(0) &&
            $value->isLessThan(100_000) &&
            $value->getScale() <= 2
        );
    }

    public function checkDiscountRate($value)
    {
        V::floatVal()->check($value);
        $value = Decimal::of($value);

        $totalWithoutDiscountRaw = $this->getAttributeFromArray('total_without_discount');
        if (!$this->validation['total_without_discount']->validate($totalWithoutDiscountRaw)) {
            return true;
        }
        $totalWithoutDiscount = Decimal::of($totalWithoutDiscountRaw);

        // - Si le total sans remise est à 0, la remise est forcément à 0 aussi.
        if ($totalWithoutDiscount->isZero()) {
            return $value->isZero();
        }

        $totalDiscountableRaw = $this->getAttributeFromArray('total_discountable');
        if ($totalDiscountableRaw === null) {
            return $value->isLessThan(100) ?: 'discount-rate-exceeds-maximum';
        }

        if (!$this->validation['total_discountable']->validate($totalDiscountableRaw)) {
            return true;
        }
        $totalDiscountable = Decimal::of($totalDiscountableRaw);

        // - Si le total remisable est à 0, il ne peut pas y avoir de remise.
        if ($totalDiscountable->isZero()) {
            return $value->isZero();
        }

        $maxDiscountRate = $totalDiscountable
            ->multipliedBy(100)
            ->dividedBy($totalWithoutDiscount, 4, RoundingMode::HALF_UP);

        return !$value->isGreaterThan($maxDiscountRate) ?: 'discount-rate-exceeds-maximum';
    }

    public function checkVatRate($value)
    {
        V::floatVal()->check($value);
        $value = Decimal::of($value);

        return (
            $value->isGreaterThanOrEqualTo(0) &&
            $value->isLessThan(100) &&
            $value->getScale() <= 2
        );
    }

    public function checkAmount($value)
    {
        V::floatVal()->check($value);
        $value = Decimal::of($value);

        return (
            $value->isGreaterThanOrEqualTo(0) &&
            $value->isLessThan(1_000_000_000_000) &&
            $value->getScale() <= 2
        );
    }

    public function checkAuthorId($value)
    {
        V::optional(V::numericVal())->check($value);

        if ($value === null) {
            return true;
        }

        $author = User::find($value);
        if (!$author) {
            return false;
        }

        return !$this->exists || $this->isDirty('author_id')
            ? !$author->trashed()
            : true;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function booking()
    {
        return $this->morphTo('booking');
    }

    public function materials()
    {
        return $this->hasMany(EstimateMaterial::class, 'estimate_id')
            ->orderBy('id');
    }

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class)
            ->withTrashed();
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id')
            ->withTrashed();
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $appends = [
        'url',
    ];

    protected $casts = [
        'date' => 'immutable_datetime',
        'booking_type' => 'string',
        'booking_id' => 'integer',
        'booking_title' => 'string',
        'booking_start_date' => 'immutable_datetime',
        'booking_end_date' => 'immutable_datetime',
        'beneficiary_id' => 'integer',
        'degressive_rate' => AsDecimal::class,
        'discount_rate' => AsDecimal::class,
        'vat_rate' => AsDecimal::class,
        'daily_total' => AsDecimal::class,
        'total_without_discount' => AsDecimal::class,
        'total_discountable' => AsDecimal::class,
        'total_discount' => AsDecimal::class,
        'total_without_taxes' => AsDecimal::class,
        'total_taxes' => AsDecimal::class,
        'total_with_taxes' => AsDecimal::class,
        'total_replacement' => AsDecimal::class,
        'currency' => 'string',
        'author_id' => 'integer',
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
        'deleted_at' => 'immutable_datetime',
    ];

    public function getUrlAttribute(): ?string
    {
        if (!$this->exists) {
            return null;
        }

        return (string) Config::getBaseUri()
            ->withPath(sprintf('/estimates/%s/pdf', $this->id));
    }

    public function getBookingDurationAttribute(): FullDuration
    {
        $period = new Period(
            $this->booking_start_date,
            $this->booking_end_date,
        );
        return new FullDuration($period);
    }

    public function getBookingLocationAttribute(): ?string
    {
        return $this->booking instanceof Event
            ? $this->booking->location
            : null;
    }

    public function getMaterialsAttribute(): Collection
    {
        return $this->getRelationValue('materials');
    }

    // ------------------------------------------------------
    // -
    // -    PDF Related
    // -
    // ------------------------------------------------------

    protected function getPdfName(I18n $i18n): string
    {
        $company = Config::get('companyData');
        return Str::slugify(implode('-', [
            $i18n->translate('Estimate'),
            $company['name'],
            $this->date->format('Ymd-Hi'),
            $this->beneficiary->full_name,
        ]));
    }

    protected function getPdfData(): array
    {
        $categoriesTotals = [];
        $categories = Category::get()->pluck('name', 'id')->all();
        foreach ($this->materials as $material) {
            $isHiddenIfZero = $material->is_hidden_on_bill;
            if ($isHiddenIfZero && $material->total_price->isZero()) {
                continue;
            }

            $categoryId = $material->material?->category_id ?? 0;
            if (!array_key_exists($categoryId, $categoriesTotals)) {
                $name = $categoryId ? ($categories[$categoryId] ?? null) : null;
                $categoriesTotals[$categoryId] = [
                    'id' => $categoryId,
                    'name' => $name,
                    'quantity' => 0,
                    'subTotal' => Decimal::zero(),
                ];
            }

            $categoriesTotals[$categoryId]['quantity'] += $material->quantity;
            $categoriesTotals[$categoryId]['subTotal'] = (
                $categoriesTotals[$categoryId]['subTotal']
                    ->plus($material->total_price)
            );
        }
        $categoriesTotals = (new Collection($categoriesTotals))
            ->sort(function ($a, $b) {
                if ($a['name'] === null) {
                    return 1;
                }
                if ($b['name'] === null) {
                    return -1;
                }
                return strcasecmp($a['name'], $b['name']);
            })
            ->values()
            ->all();

        return [
            'date' => $this->date,
            'company' => Config::get('companyData'),
            'beneficiary' => $this->beneficiary,
            'currency' => $this->currency,
            'booking' => [
                'title' => $this->booking_title,
                'duration' => $this->booking_duration,
                'start_date' => $this->booking_start_date,
                'end_date' => $this->booking_end_date,
                'location' => $this->booking_location,
            ],
            'hasVat' => !$this->vat_rate->isZero(),
            'hasDiscount' => !$this->discount_rate->isZero(),
            'degressiveRate' => $this->degressive_rate,
            'discountRate' => $this->discount_rate->dividedBy(100, 6),
            'vatRate' => $this->vat_rate->dividedBy(100, 4),
            'dailyTotal' => $this->daily_total,
            'totalWithoutDiscount' => $this->total_without_discount,
            'totalDiscountable' => $this->total_discountable,
            'totalDiscount' => $this->total_discount,
            'totalWithoutTaxes' => $this->total_without_taxes,
            'totalTaxes' => $this->total_taxes,
            'totalWithTaxes' => $this->total_with_taxes,
            'categoriesSubTotals' => $categoriesTotals,
            'materials' => (
                (new MaterialsCollection($this->materials))
                    ->bySubCategories()
            ),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'date',
        'booking_title',
        'booking_start_date',
        'booking_end_date',
        'degressive_rate',
        'discount_rate',
        'vat_rate',
        'daily_total',
        'total_without_discount',
        'total_discountable',
        'total_discount',
        'total_without_taxes',
        'total_taxes',
        'total_with_taxes',
        'total_replacement',
        'currency',
    ];

    // ------------------------------------------------------
    // -
    // -    Méthodes de "repository"
    // -
    // ------------------------------------------------------

    public static function createFromBooking(Event $booking, User $creator): Estimate
    {
        if (!$booking->is_billable) {
            throw new \InvalidArgumentException("Booking is not billable.");
        }

        $beneficiary = $booking instanceof Event
            ? $booking->beneficiaries->first()
            : $booking->borrower;

        if ($beneficiary === null) {
            throw new \InvalidArgumentException(
                "A beneficiary must be defined in the booking to be able to generate an estimate."
            );
        }

        /** @var Collection|EventMaterial[] $materials */
        $materials = $booking instanceof Event
            ? $booking->materials->pluck('pivot')
            : $booking->materials;

        if ($materials->isEmpty()) {
            throw new \InvalidArgumentException(
                "The booking must contain at least one material for an estimate to be generated."
            );
        }

        return dbTransaction(function () use ($booking, $beneficiary, $materials, $creator) {
            $estimate = new static([
                'date' => CarbonImmutable::now(),

                'booking_title' => $booking instanceof Event ? $booking->title : null,
                'booking_start_date' => $booking->getStartDate(),
                'booking_end_date' => $booking->getEndDate(),

                'degressive_rate' => $booking->degressive_rate,
                'discount_rate' => $booking->discount_rate,
                'vat_rate' => $booking->vat_rate,

                // - Total / jour.
                'daily_total' => $booking->daily_total,

                // - Remise.
                'total_without_discount' => $booking->total_without_discount,
                'total_discountable' => $booking->total_discountable,
                'total_discount' => $booking->total_discount,

                // - Totaux.
                'total_without_taxes' => $booking->total_without_taxes,
                'total_taxes' => $booking->total_taxes,
                'total_with_taxes' => $booking->total_with_taxes,

                'total_replacement' => $booking->total_replacement,
                'currency' => $booking->currency,
            ]);
            $estimate->booking()->associate($booking);
            $estimate->beneficiary()->associate($beneficiary);
            $estimate->author()->associate($creator);

            if (!$estimate->save()) {
                return false;
            }

            // - Attache le matériel au devis.
            foreach ($materials as $bookingMaterial) {
                $material = $bookingMaterial->material;
                $estimateMaterial = new EstimateMaterial([
                    'material_id' => $bookingMaterial->material_id,
                    'name' => $material->name,
                    'reference' => $material->reference,
                    'quantity' => $bookingMaterial->quantity,
                    'unit_price' => $bookingMaterial->unit_price,
                    'total_price' => $bookingMaterial->total_price,
                    'replacement_price' => $bookingMaterial->unit_replacement_price,
                    'is_hidden_on_bill' => $material->is_hidden_on_bill,
                    'is_discountable' => $bookingMaterial->is_discountable,
                ]);
                $estimate->materials()->save($estimateMaterial);
            }

            return $estimate->refresh();
        });
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(): array
    {
        $data = $this->attributesForSerialization();
        return Arr::only($data, [
            'id',
            'date',
            'url',
            'discount_rate',
            'total_without_taxes',
            'total_with_taxes',
            'currency',
        ]);
    }
}
