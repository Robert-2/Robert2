<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Config\Config;
use Robert2\API\Models\Traits\WithPdf;
use Robert2\API\Services\I18n;
use Robert2\API\Validation\Validator as V;
use Robert2\Lib\Domain\EventData;

class Bill extends BaseModel
{
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
            'number'             => V::notEmpty()->length(4, 20),
            'date'               => V::notEmpty()->date(),
            'event_id'           => V::notEmpty()->numeric(),
            'beneficiary_id'     => V::notEmpty()->numeric(),
            'materials'          => V::notEmpty(),
            'degressive_rate'    => V::notEmpty()->floatVal()->between(0.0, 99.99, true),
            'discount_rate'      => V::optional(V::floatVal()->between(0.0, 99.9999, true)),
            'vat_rate'           => V::optional(V::floatVal()->between(0.0, 99.99, true)),
            'due_amount'         => V::notEmpty()->floatVal()->between(0.0, 999999.99, true),
            'replacement_amount' => V::notEmpty()->floatVal()->between(0.0, 999999.99, true),
            'currency'           => V::notEmpty()->length(3),
            'user_id'            => V::optional(V::numeric()),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function Event()
    {
        return $this->belongsTo('Robert2\API\Models\Event')
            ->select(['events.id', 'title', 'location', 'start_date', 'end_date']);
    }

    public function Beneficiary()
    {
        return $this->belongsTo('Robert2\API\Models\Person')
            ->select(['persons.id', 'first_name', 'last_name', 'street', 'postal_code', 'locality']);
    }

    public function User()
    {
        return $this->belongsTo('Robert2\API\Models\User')
            ->select(['users.id', 'pseudo', 'email', 'group_id']);
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'number'             => 'string',
        'date'               => 'string',
        'event_id'           => 'integer',
        'beneficiary_id'     => 'integer',
        'materials'          => 'array',
        'degressive_rate'    => 'float',
        'discount_rate'      => 'float',
        'vat_rate'           => 'float',
        'due_amount'         => 'float',
        'replacement_amount' => 'float',
        'currency'           => 'string',
        'user_id'            => 'integer',
    ];

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

    public function createFromEvent(int $eventId, int $userId, float $discountRate = 0.0): Bill
    {
        $billEvent = (new Event)
            ->with('Beneficiaries')
            ->with('Materials')
            ->findOrFail($eventId);

        $date = new \DateTime();
        $eventData = $billEvent->toArray();

        if (!$eventData['is_billable']) {
            throw new \InvalidArgumentException("Event is not billable.");
        }

        $newNumber = EventData::createBillNumber($date, $this->getLastBillNumber());
        $EventData = new EventData($date, $eventData, $newNumber, $userId);
        $EventData->setDiscountRate($discountRate);

        $newBillData = $EventData->toModelArray();

        $this->deleteByNumber($newBillData['number']);

        $newBill = new Bill();
        $newBill->fill($newBillData)->save();

        return $newBill;
    }

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
            slugify($bill->Beneficiary->full_name)
        );
        if (Config::getEnv() === 'test') {
            $fileName = sprintf('TEST-%s', $fileName);
        }

        return $fileName;
    }

    public function getPdfContent(int $id): string
    {
        $bill = static::findOrFail($id);
        $date = new \DateTime($bill->date);

        $event = (new Event)
            ->with('Beneficiaries')
            ->with('Materials')
            ->find($bill->event_id)
            ->toArray();

        $categories = (new Category())->getAll()->get()->toArray();
        $parks = (new Park())->getAll()->get()->toArray();

        $EventData = new EventData($date, $event, $bill->number, $bill->user_id);
        $EventData->setDiscountRate($bill->discount_rate)
            ->setCategories($categories)
            ->setParks($parks);

        $billPdf = $this->_getPdfAsString($EventData->toPdfTemplateArray());
        if (!$billPdf) {
            $lastError = error_get_last();
            throw new \RuntimeException(sprintf(
                "Unable to create PDF file. Reason: %s",
                $lastError['message']
            ));
        }

        return $billPdf;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    public function deleteByNumber(string $number): void
    {
        $bill = static::where('number', $number);
        if (!$bill) {
            return;
        }

        $bill->forceDelete();
    }

    public function getLastBillNumber(): int
    {
        $allBills = static::selectRaw('number')
            ->whereRaw(sprintf('YEAR(date) = %s', date('Y')))
            ->get();

        $lastBillNumber = 0;
        foreach ($allBills as $existingBill) {
            $billNumber = explode('-', $existingBill->number);
            $lastBillNumber = max((int)$billNumber[1], $lastBillNumber);
        }

        return $lastBillNumber;
    }
}
