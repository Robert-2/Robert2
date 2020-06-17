<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Respect\Validation\Validator as V;

use Robert2\API\Errors;
use Robert2\API\Models\Traits\WithPdf;
use Robert2\Lib\Domain\EventBill;

class Bill extends BaseModel
{
    use SoftDeletes;
    use WithPdf;

    protected $table = 'bills';

    protected $_modelName = 'Bill';
    protected $_orderField = 'date';
    protected $_orderDirection = 'desc';

    protected $_allowedSearchFields = ['number', 'due_amount', 'date'];
    protected $_searchField = 'number';

    public function __construct()
    {
        parent::__construct();

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

    public function deleteByNumber(string $number): void
    {
        $bill = self::where('number', $number);
        if (!$bill) {
            return;
        }

        $foundBill = $bill->first();
        if ($foundBill) {
            $this->_unlinkPdf($foundBill->id);
        }

        $bill->forceDelete();
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

    public function createFromEvent(int $eventId, int $userId, float $discountRate = 0.0): Model
    {
        $Event = new Event();
        $billEvent = $Event
            ->with('Beneficiaries')
            ->with('Materials')
            ->find($eventId);

        if (!$billEvent) {
            throw new Errors\NotFoundException("Event not found.");
        }

        $date = new \DateTime();
        $eventData = $billEvent->toArray();

        if (!$eventData['is_billable']) {
            throw new \InvalidArgumentException("Event is not billable.");
        }

        $EventBill = new EventBill($date, $eventData, $userId);
        $EventBill->setDiscountRate($discountRate);
        $newBillData = $EventBill->toModelArray();

        $this->deleteByNumber($newBillData['number']);

        $newBill = new Bill();
        $newBill->fill($newBillData)->save();

        $categories = (new Category())->getAll()->get()->toArray();
        if (!$this->_savePdf($newBill->id, $EventBill->toPdfTemplateArray($categories))) {
            $newBill->remove($newBill->id, ['force' => true]);
            $lastError = error_get_last();
            throw new \RuntimeException(sprintf(
                "Unable to create PDF file. Reason: %s",
                $lastError['message']
            ));
        }

        return $newBill;
    }

    // - Overwrites the BaseModel::remove() method to add PDF file deletion
    public function remove(int $id, array $options = []): ?Model
    {
        $options = array_merge([
            'force' => false
        ], $options);

        $bill = self::withTrashed()->find($id);
        if (empty($bill)) {
            throw new Errors\NotFoundException;
        }

        if ($bill->trashed() || $options['force'] === true) {
            $this->_unlinkPdf($id);
            if (!$bill->forceDelete()) {
                throw new \RuntimeException("Unable to destroy $this->_modelName ID #$id.");
            }
            return null;
        }

        if (!$bill->delete()) {
            throw new \RuntimeException("Unable to delete $this->_modelName ID #$id.");
        }

        return $bill;
    }
}
