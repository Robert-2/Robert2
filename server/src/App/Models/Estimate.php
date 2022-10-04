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

class Estimate extends BaseModel implements Serializable
{
    use Serializer;
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
        $estimate = $this->withTrashed()->findOrFail($id);
        $company = Config::getSettings('companyData');
        $date = new \DateTime($estimate->date);

        $i18n = new I18n(Config::getSettings('defaultLang'));
        $fileName = sprintf(
            '%s-%s-%s-%s.pdf',
            $i18n->translate('Estimate'),
            slugify($company['name']),
            $date->format('Ymd-Hi'),
            slugify($estimate->beneficiary->full_name)
        );
        if (Config::getEnv() === 'test') {
            $fileName = sprintf('TEST-%s', $fileName);
        }

        return $fileName;
    }

    public function getPdfContent(int $id): string
    {
        $estimate = static::findOrFail($id);

        $data = (new EventData($estimate->event))
            ->setDiscountRate($estimate->discount_rate)
            ->toBillingPdfData(new \DateTime($estimate->date));

        $estimatePdf = $this->_getPdfAsString($data);
        if (!$estimatePdf) {
            $lastError = error_get_last();
            throw new \RuntimeException(sprintf(
                "Unable to create PDF file. Reason: %s",
                $lastError['message']
            ));
        }

        return $estimatePdf;
    }

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

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
    // -
    // ------------------------------------------------------

    public static function createFromEvent(int $eventId, int $creatorId, float $discountRate = 0.0): Estimate
    {
        $event = Event::findOrFail($eventId);
        if (!$event->is_billable) {
            throw new \InvalidArgumentException("Event is not billable.");
        }

        $data = (new EventData($event))
            ->setDiscountRate($discountRate)
            ->toBillingModelData($creatorId);

        $newEstimate = new Estimate($data);
        $newEstimate->save();

        return $newEstimate;
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
