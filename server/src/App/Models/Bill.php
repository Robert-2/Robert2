<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Config\Config;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Traits\Serializer;
use Robert2\API\Models\Traits\WithPdf;
use Robert2\API\Services\I18n;
use Robert2\API\Validation\Validator as V;
use Robert2\Lib\Domain\EventData;

class Bill extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletes;
    use WithPdf;

    protected $orderField = 'date';
    protected $orderDirection = 'desc';

    protected $allowedSearchFields = ['number', 'due_amount', 'date'];
    protected $searchField = 'number';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->pdfTemplate = 'bill-default';

        $this->validation = [
            'number' => V::callback([$this, 'checkNumber']),
            'date' => V::notEmpty()->date(),
            'event_id' => V::notEmpty()->numeric(),
            'beneficiary_id' => V::notEmpty()->numeric(),
            'materials' => V::notEmpty(),
            'degressive_rate' => V::notEmpty()->floatVal()->between(0.0, 99999.99, true),
            'discount_rate' => V::optional(V::floatVal()->between(0.0, 99.9999, true)),
            'vat_rate' => V::optional(V::floatVal()->between(0.0, 99.99, true)),
            'due_amount' => V::notEmpty()->floatVal()->between(0.0, 999999.99, true),
            'replacement_amount' => V::floatVal()->between(0.0, 999999.99, true),
            'currency' => V::notEmpty()->length(3),
            'user_id' => V::optional(V::numeric()),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

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
            return 'bill-number-already-in-use';
        }

        return true;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'number' => 'string',
        'date' => 'string',
        'event_id' => 'integer',
        'beneficiary_id' => 'integer',
        'materials' => 'array',
        'degressive_rate' => 'float',
        'discount_rate' => 'float',
        'vat_rate' => 'float',
        'due_amount' => 'float',
        'replacement_amount' => 'float',
        'currency' => 'string',
        'user_id' => 'integer',
    ];

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getPdfName(int $id): string
    {
        $bill = $this->withTrashed()->findOrFail($id);
        $company = Config::getSettings('companyData');

        $i18n = new I18n(Config::getSettings('defaultLang'));
        $fileName = sprintf(
            '%s-%s-%s-%s.pdf',
            $i18n->translate('Bill'),
            slugify($company['name']),
            $bill->number,
            slugify($bill->beneficiary->full_name)
        );
        if (Config::getEnv() === 'test') {
            $fileName = sprintf('TEST-%s', $fileName);
        }

        return $fileName;
    }

    public function getPdfContent(int $id): string
    {
        $bill = static::findOrFail($id);

        $data = (new EventData($bill->event))
            ->setDiscountRate($bill->discount_rate)
            ->toBillingPdfData(new \DateTime($bill->date), $bill->number);

        $billPdf = $this->_getPdfAsString($data);
        if (!$billPdf) {
            $lastError = error_get_last();
            throw new \RuntimeException(sprintf(
                "Unable to create PDF file. Reason: %s",
                $lastError['message']
            ));
        }

        return $billPdf;
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'number',
        'date',
        'event_id',
        'beneficiary_id',
        'materials',
        'degressive_rate',
        'discount_rate',
        'vat_rate',
        'due_amount',
        'replacement_amount',
        'currency',
        'user_id',
    ];

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
    // -
    // ------------------------------------------------------

    public static function createFromEvent(int $eventId, int $creatorId, float $discountRate = 0.0): Bill
    {
        $event = Event::findOrFail($eventId);
        if (!$event->is_billable) {
            throw new \InvalidArgumentException("Event is not billable.");
        }

        $newNumber = static::getNextNumber();
        $data = (new EventData($event))
            ->setDiscountRate($discountRate)
            ->toBillingModelData($creatorId, null, $newNumber);

        static::deleteByNumber($data['number']);
        $newBill = new Bill($data);
        $newBill->save();

        return $newBill;
    }

    public static function deleteByNumber(string $number): void
    {
        $bill = static::where('number', $number);
        if (!$bill) {
            return;
        }

        $bill->forceDelete();
    }

    public static function getLastNumber(int $year = null): ?string
    {
        $year = (int)($year ?? date('Y'));

        $bills = static::selectRaw('number')
            ->whereRaw(sprintf('YEAR(date) = %s', $year))
            ->get();

        $lastBill = null;
        foreach ($bills as $bill) {
            $numericNumber = (int)explode('-', $bill->number)[1];
            if ($lastBill === null || $numericNumber > $lastBill['numericNumber']) {
                $lastBill = compact('bill', 'numericNumber');
            }
        }

        return $lastBill ? $lastBill['bill']->number : null;
    }

    public static function getNextNumber(int $year = null): string
    {
        $year = (int)($year ?? date('Y'));

        $lastNumber = static::getLastNumber($year);
        if ($lastNumber !== null) {
            $lastNumber = (int)explode('-', $lastNumber)[1];
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

        unset(
            $data['created_at'],
            $data['updated_at'],
            $data['deleted_at'],
        );

        return $data;
    }
}
