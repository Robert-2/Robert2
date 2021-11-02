<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Config\Config;
use Robert2\API\Models\Traits\WithPdf;
use Robert2\API\Services\I18n;
use Robert2\API\Validation\Validator as V;
use Robert2\Lib\Domain\EventData;

class Estimate extends BaseModel
{
    use SoftDeletes;
    use WithPdf;

    protected $orderField = 'date';
    protected $orderDirection = 'desc';

    protected $allowedSearchFields = ['due_amount', 'date'];
    protected $searchField = 'date';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->pdfTemplate = 'estimate-default';

        $this->validation = [
            'date' => V::notEmpty()->date(),
            'event_id' => V::notEmpty()->numeric(),
            'beneficiary_id' => V::notEmpty()->numeric(),
            'materials' => V::notEmpty(),
            'degressive_rate' => V::notEmpty()->floatVal()->between(0.0, 99.99, true),
            'discount_rate' => V::optional(V::floatVal()->between(0.0, 99.9999, true)),
            'vat_rate' => V::optional(V::floatVal()->between(0.0, 99.99, true)),
            'due_amount' => V::notEmpty()->floatVal()->between(0.0, 999999.99, true),
            'replacement_amount' => V::notEmpty()->floatVal()->between(0.0, 999999.99, true),
            'currency' => V::notEmpty()->length(3),
            'user_id' => V::optional(V::numeric()),
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
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
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

    public static function createFromEvent(int $eventId, int $userId, float $discountRate = 0.0): Estimate
    {
        $estimateEvent = (new Event)
            ->with('Beneficiaries')
            ->with('Materials')
            ->findOrFail($eventId);

        $date = new \DateTime();
        $eventData = $estimateEvent->toArray();

        if (!$eventData['is_billable']) {
            throw new \InvalidArgumentException("Event is not billable.");
        }

        $EventData = new EventData($date, $eventData, 'estimate', $userId);
        $EventData->setDiscountRate($discountRate);

        $newEstimateData = $EventData->toModelArray();

        $newEstimate = new Estimate();
        $newEstimate->fill($newEstimateData)->save();

        return $newEstimate;
    }

    public function getPdfName(int $id): string
    {
        $estimate = $this->withTrashed()->findOrFail($id);
        $company = Config::getSettings('companyData');
        $date = new \DateTime($estimate->date);

        $i18n = new I18n(Config::getSettings('defaultLang'));
        $fileName = sprintf(
            '%s-%s-%s-%s.pdf',
            $i18n->translate('Estimate'),
            slugify($company['name']),
            $date->format('Ymd-Hi'),
            slugify($estimate->Beneficiary->full_name)
        );
        if (Config::getEnv() === 'test') {
            $fileName = sprintf('TEST-%s', $fileName);
        }

        return $fileName;
    }

    public function getPdfContent(int $id): string
    {
        $estimate = static::findOrFail($id);
        $date = new \DateTime($estimate->date);

        $eventData = (new Event)
            ->with('Beneficiaries')
            ->with('Materials')
            ->find($estimate->event_id)
            ->toArray();

        $categories = (new Category())->getAll()->get()->toArray();
        $parks = (new Park())->getAll()->get()->toArray();

        $EventData = new EventData($date, $eventData, 'estimate', $estimate->user_id);
        $EventData->setDiscountRate($estimate->discount_rate)
            ->setCategories($categories)
            ->setParks($parks);

        $estimatePdf = $this->_getPdfAsString($EventData->toPdfTemplateArray());
        if (!$estimatePdf) {
            $lastError = error_get_last();
            throw new \RuntimeException(sprintf(
                "Unable to create PDF file. Reason: %s",
                $lastError['message']
            ));
        }

        return $estimatePdf;
    }
}
