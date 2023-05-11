<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Brick\Math\BigDecimal as Decimal;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Respect\Validation\Validator as V;
use Robert2\API\Config\Config;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Casts\AsDecimal;
use Robert2\API\Models\Traits\Pdfable;
use Robert2\API\Models\Traits\Serializer;
use Robert2\API\Models\Traits\SoftDeletable;
use Robert2\API\Services\I18n;
use Robert2\Support\Arr;
use Robert2\Support\Collections\MaterialsCollection;
use Robert2\Support\Str;

/**
 * Facture.
 *
 * @property-read ?int $id
 * @property string $number
 * @property Carbon $date
 * @property-read ?string $url
 * @property string $booking_type
 * @property int $booking_id
 * @property-read Event $booking
 * @property string|null $booking_title
 * @property-read int $booking_duration
 * @property Carbon $booking_start_date
 * @property Carbon $booking_end_date
 * @property-read string|null $booking_location
 * @property int $beneficiary_id
 * @property-read Beneficiary $beneficiary
 * @property Decimal $degressive_rate
 * @property Decimal $discount_rate
 * @property Decimal $vat_rate
 * @property Decimal $daily_total_without_discount
 * @property Decimal $daily_total_discountable
 * @property Decimal $daily_total_discount
 * @property Decimal $daily_total_without_taxes
 * @property Decimal $daily_total_taxes
 * @property Decimal $daily_total_with_taxes
 * @property Decimal $total_without_taxes
 * @property Decimal $total_taxes
 * @property Decimal $total_with_taxes
 * @property Decimal $total_replacement
 * @property string $currency
 * @property int|null $author_id
 * @property-read User|null $author
 * @property-read Carbon $created_at
 * @property-read Carbon|null $updated_at
 * @property-read Carbon|null $deleted_at
 *
 * @property-read Collection|InvoiceMaterial[] $materials
 */
final class Invoice extends BaseModel implements Serializable
{
    use Pdfable;
    use Serializer;
    use SoftDeletable;

    protected const PDF_TEMPLATE = 'invoice-default';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'number' => V::custom([$this, 'checkNumber']),
            'date' => V::notEmpty()->dateTime(),
            'booking_type' => V::notEmpty()->anyOf(
                V::equals(Event::TYPE),
            ),
            'booking_id' => V::custom([$this, 'checkBooking']),
            'booking_title' => V::optional(V::length(2, 191)),
            'booking_start_date' => V::dateTime(),
            'booking_end_date' => V::custom([$this, 'checkBookingEndDate']),
            'beneficiary_id' => V::custom([$this, 'checkBeneficiary']),
            'degressive_rate' => V::custom([$this, 'checkDegressiveRate']),
            'discount_rate' => V::custom([$this, 'checkDiscountRate']),
            'vat_rate' => V::custom([$this, 'checkVatRate']),
            'daily_total_without_discount' => V::custom([$this, 'checkAmount']),
            'daily_total_discountable' => V::custom([$this, 'checkAmount']),
            'daily_total_discount' => V::custom([$this, 'checkAmount']),
            'daily_total_without_taxes' => V::custom([$this, 'checkAmount']),
            'daily_total_taxes' => V::custom([$this, 'checkAmount']),
            'daily_total_with_taxes' => V::custom([$this, 'checkAmount']),
            'total_without_taxes' => V::custom([$this, 'checkAmount']),
            'total_taxes' => V::custom([$this, 'checkAmount']),
            'total_with_taxes' => V::custom([$this, 'checkAmount']),
            'total_replacement' => V::custom([$this, 'checkAmount']),
            'currency' => V::notEmpty()->allOf(V::uppercase(), V::length(3, 3)),
            'author_id' => V::custom([$this, 'checkAuthor']),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkBooking($value)
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

    public function checkNumber($value)
    {
        V::notEmpty()
            ->length(4, 20)
            ->check($value);

        $query = static::where('number', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        if ($query->withTrashed()->exists()) {
            return 'invoice-number-already-in-use';
        }

        return true;
    }

    public function checkBeneficiary($value)
    {
        V::notEmpty()->numericVal()->check($value);
        return Beneficiary::staticExists($value);
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

        return (
            $value->isGreaterThanOrEqualTo(0) &&
            $value->isLessThan(100) &&
            $value->getScale() <= 4
        );
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

    public function checkAuthor($value)
    {
        V::optional(V::numericVal())->check($value);

        return $value !== null
            ? User::staticExists($value)
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
        return $this->hasMany(InvoiceMaterial::class, 'invoice_id')
            ->orderBy('id');
    }

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
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
        'number' => 'string',
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
        'daily_total_without_discount' => AsDecimal::class,
        'daily_total_discountable' => AsDecimal::class,
        'daily_total_discount' => AsDecimal::class,
        'daily_total_without_taxes' => AsDecimal::class,
        'daily_total_taxes' => AsDecimal::class,
        'daily_total_with_taxes' => AsDecimal::class,
        'total_without_taxes' => AsDecimal::class,
        'total_taxes' => AsDecimal::class,
        'total_with_taxes' => AsDecimal::class,
        'total_replacement' => AsDecimal::class,
        'currency' => 'string',
        'author_id' => 'integer',
    ];

    public function getUrlAttribute(): ?string
    {
        if (!$this->exists) {
            return null;
        }

        $baseUrl = rtrim(Config::getSettings('apiUrl'), '/');
        return sprintf('%s/invoices/%s/pdf', $baseUrl, $this->id);
    }

    public function getBookingDurationAttribute(): int
    {
        $startDate = $this->booking_start_date;
        $endDate = $this->booking_end_date;

        $diff = $startDate->diff($endDate);
        return (int) $diff->format('%a') + 1;
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
        $company = Config::getSettings('companyData');
        return Str::slugify(implode('-', [
            $i18n->translate('Invoice'),
            $company['name'],
            $this->number,
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
            'number' => $this->number,
            'date' => $this->date,
            'company' => Config::getSettings('companyData'),
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
            'dailyTotalWithoutDiscount' => $this->daily_total_without_discount,
            'dailyTotalDiscountable' => $this->daily_total_discountable,
            'dailyTotalDiscount' => $this->daily_total_discount,
            'dailyTotalWithoutTaxes' => $this->daily_total_without_taxes,
            'dailyTotalTaxes' => $this->daily_total_taxes,
            'dailyTotalWithTaxes' => $this->daily_total_with_taxes,
            'totalWithoutTaxes' => $this->total_without_taxes,
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
        'number',
        'date',
        'booking_title',
        'booking_start_date',
        'booking_end_date',
        'degressive_rate',
        'discount_rate',
        'vat_rate',
        'daily_total_without_discount',
        'daily_total_discountable',
        'daily_total_discount',
        'daily_total_without_taxes',
        'daily_total_taxes',
        'daily_total_with_taxes',
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

    public static function createFromBooking(Event $booking, User $creator): Invoice
    {
        if (!$booking->is_billable) {
            throw new \InvalidArgumentException("Booking is not billable.");
        }

        $beneficiary = $booking instanceof Event
            ? $booking->beneficiaries->first()
            : $booking->borrower;

        if ($beneficiary === null) {
            throw new \InvalidArgumentException(
                "A beneficiary must be defined in the booking to be able to generate an invoice."
            );
        }

        /** @var Collection|EventMaterial[] $materials */
        $materials = $booking instanceof Event
            ? $booking->materials->pluck('pivot')
            : $booking->materials;

        if ($materials->isEmpty()) {
            throw new \InvalidArgumentException(
                "The booking must contain at least one material for an invoice to be generated."
            );
        }

        return dbTransaction(function () use ($booking, $beneficiary, $materials, $creator) {
            $invoice = new static([
                'number' => static::getNextNumber(),
                'date' => CarbonImmutable::now(),

                'booking_title' => $booking instanceof Event ? $booking->title : null,
                'booking_start_date' => $booking->getStartDate(),
                'booking_end_date' => $booking->getEndDate(),

                'degressive_rate' => $booking->degressive_rate,
                'discount_rate' => $booking->discount_rate,
                'vat_rate' => $booking->vat_rate,

                // - Remise.
                'daily_total_without_discount' => $booking->daily_total_without_discount,
                'daily_total_discountable' => $booking->daily_total_discountable,
                'daily_total_discount' => $booking->daily_total_discount,
                'daily_total_without_taxes' => $booking->daily_total_without_taxes,

                // - Taxes.
                'daily_total_taxes' => $booking->daily_total_taxes,
                'daily_total_with_taxes' => $booking->daily_total_with_taxes,

                // - Totaux.
                'total_without_taxes' => $booking->total_without_taxes,
                'total_taxes' => $booking->total_taxes,
                'total_with_taxes' => $booking->total_with_taxes,

                'total_replacement' => $booking->total_replacement,
                'currency' => $booking->currency,
            ]);
            $invoice->booking()->associate($booking);
            $invoice->beneficiary()->associate($beneficiary);
            $invoice->author()->associate($creator);

            if (!$invoice->save()) {
                return false;
            }

            // - Attache le matériel à la facture.
            foreach ($materials as $bookingMaterial) {
                $material = $bookingMaterial->material;
                $invoiceMaterial = new InvoiceMaterial([
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
                $invoice->materials()->save($invoiceMaterial);
            }

            return $invoice->refresh();
        });
    }

    public static function getLastNumber(?int $year = null): ?string
    {
        $year = (int) ($year ?? Carbon::now()->format('Y'));

        $invoices = static::selectRaw('number')
            ->whereRaw(sprintf('YEAR(date) = %s', $year))
            ->get();

        $last = null;
        foreach ($invoices as $invoice) {
            $numericNumber = (int) explode('-', $invoice->number)[1];
            if ($last === null || $numericNumber > $last['numericNumber']) {
                $last = compact('invoice', 'numericNumber');
            }
        }

        return $last ? $last['invoice']->number : null;
    }

    public static function getNextNumber(?int $year = null): string
    {
        $year = (int) ($year ?? Carbon::now()->format('Y'));

        $lastNumber = static::getLastNumber($year);
        if ($lastNumber !== null) {
            $lastNumber = (int) explode('-', $lastNumber)[1];
        }

        return sprintf('%s-%05d', $year, ($lastNumber ?? 0) + 1);
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
            'number',
            'date',
            'url',
            'discount_rate',
            'total_without_taxes',
            'total_with_taxes',
            'currency',
        ]);
    }
}
