<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Respect\Validation\Validator as V;

use Robert2\API\Config\Config;
use Robert2\API\Models\Material;
use Robert2\API\I18n\I18n;
use Robert2\API\Models\Traits\WithPdf;
use Robert2\Lib\Domain\EventBill;
use Robert2\API\Errors\ValidationException;

class Event extends BaseModel
{
    use SoftDeletes;
    use WithPdf;

    protected $table = 'events';

    protected $_modelName = 'Event';
    protected $_orderField = 'start_date';
    protected $_orderDirection = 'asc';

    protected $_startDate;
    protected $_endDate;

    protected $_allowedSearchFields = ['title', 'start_date', 'end_date', 'location'];
    protected $_searchField = 'title';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->pdfTemplate = 'event-summary-default';

        $thisYear = date('Y');
        $this->_startDate = new \DateTime("$thisYear-01-01");
        $this->_endDate = new \DateTime("$thisYear-12-31");

        $this->validation = [
            'user_id'      => V::notEmpty()->numeric(),
            'title'        => V::notEmpty()->length(2, 191),
            'description'  => V::optional(V::length(null, 255)),
            'start_date'   => V::notEmpty()->date(),
            'end_date'     => V::notEmpty()->date(),
            'is_confirmed' => V::notOptional()->boolType(),
            'location'     => V::optional(V::length(2, 64)),
            'is_billable'  => V::optional(V::boolType()),
        ];
    }

    public function validate(array $data, array $onlyFields = []): void
    {
        parent::validate($data, $onlyFields);

        if (!empty($onlyFields) && !in_array('end_date', $onlyFields)) {
            return;
        }

        $startDate = new \DateTime($data['start_date']);
        $endDate = new \DateTime($data['end_date']);

        if ($startDate >= $endDate) {
            $i18n = new I18n;
            $ex = new ValidationException();
            $ex->setValidationErrors([
                'end_date' => [$i18n->translate('endDateMustBeLater')]
            ]);
            throw $ex;
        }
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function User()
    {
        return $this->belongsTo('Robert2\API\Models\User')
            ->select(['users.id', 'pseudo', 'email', 'group_id']);
    }

    public function Assignees()
    {
        return $this->belongsToMany('Robert2\API\Models\Person', 'event_assignees')
            ->select(['persons.id', 'first_name', 'last_name', 'nickname']);
    }

    public function Beneficiaries()
    {
        return $this->belongsToMany('Robert2\API\Models\Person', 'event_beneficiaries')
            ->select([
                'persons.id',
                'first_name',
                'last_name',
                'company_id',
                'street',
                'postal_code',
                'locality',
            ]);
    }

    public function Materials()
    {
        $fields = [
            'materials.id',
            'name',
            'description',
            'reference',
            'park_id',
            'category_id',
            'sub_category_id',
            'rental_price',
            'stock_quantity',
            'out_of_order_quantity',
            'replacement_price',
            'serial_number',
            'is_hidden_on_bill',
            'is_discountable',
        ];

        return $this->belongsToMany('Robert2\API\Models\Material', 'event_materials')
            ->using('Robert2\API\Models\EventMaterialsPivot')
            ->withPivot('quantity')
            ->select($fields);
    }

    public function Bills()
    {
        return $this->hasMany('Robert2\API\Models\Bill')
            ->select(['bills.id', 'number', 'date', 'discount_rate', 'due_amount'])
            ->orderBy('date', 'desc');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'user_id'      => 'integer',
        'title'        => 'string',
        'description'  => 'string',
        'start_date'   => 'string',
        'end_date'     => 'string',
        'is_confirmed' => 'boolean',
        'location'     => 'string',
        'is_billable'  => 'boolean',
    ];

    public function getUserAttribute()
    {
        $user = $this->User()->first();
        return $user ? $user->toArray() : null;
    }

    public function getAssigneesAttribute()
    {
        $assignees = $this->Assignees()->get();
        return $assignees ? $assignees->toArray() : null;
    }

    public function getBeneficiariesAttribute()
    {
        $assignees = $this->Beneficiaries()->get();
        return $assignees ? $assignees->toArray() : null;
    }

    public function getMaterialsAttribute()
    {
        $materials = $this->Materials()->get();
        return $materials ? $materials->toArray() : null;
    }

    public function getBillsAttribute()
    {
        $bills = $this->Bills()->get();
        return $bills ? $bills->toArray() : null;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(bool $withDeleted = false): Builder
    {
        $start = $this->_startDate->format('Y-m-d H:i:s');
        $end = $this->_endDate->format('Y-m-d H:i:s');

        $conditions = function (Builder $query) use ($start, $end) {
            $query
                ->where([
                    ['end_date', '>', $start],
                    ['start_date', '<', $end],
                ]);
        };

        $builder = self::orderBy('start_date', 'asc')
            ->where($conditions);

        if ($withDeleted) {
            $builder = $builder->onlyTrashed();
        }

        return $builder;
    }

    public function getMissingMaterials(int $id): ?array
    {
        $event = $this->with('Materials')->find($id);
        if (!$event) {
            return null;
        }

        $material = new Material();
        $eventMaterials = $material->recalcQuantitiesForPeriod(
            $event->materials,
            $event->start_date,
            $event->end_date
        );

        $missingMaterials = array_filter($eventMaterials, function ($eventMaterial) {
            return $eventMaterial['remaining_quantity'] < 0;
        });

        return empty($missingMaterials) ? null : array_values($missingMaterials);
    }

    public function getPdfContent(int $id): string
    {
        if (!$this->exists($id)) {
            throw new Errors\NotFoundException;
        }

        $event = $this
            ->with('Assignees')
            ->with('Beneficiaries')
            ->with('Materials')
            ->find($id)
            ->toArray();

        $date = new \DateTime();
        $EventBill = new EventBill($date, $event, 'summary', $event['user_id']);
        $categories = (new Category())->getAll()->get()->toArray();

        $data = [
            'event' => $event,
            'date' => $date,
            'locale' => Config::getSettings('defaultLang'),
            'company' => Config::getSettings('companyData'),
            'currency' => Config::getSettings('currency')['iso'],
            'currencyName' => Config::getSettings('currency')['name'],
            'materialBySubCategories' => $EventBill->getMaterialBySubCategories($categories),
            'replacementAmount' => $EventBill->getReplacementAmount(),
        ];

        $eventPdf = $this->_getPdfAsString($data);
        if (!$eventPdf) {
            $lastError = error_get_last();
            throw new \RuntimeException(sprintf(
                "Unable to create PDF file. Reason: %s",
                $lastError['message']
            ));
        }

        return $eventPdf;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    public function setPeriod(?string $start, ?string $end): Event
    {
        $thisYear = date('Y');
        if (empty($start)) {
            $start = "$thisYear-01-01 00:00:00";
        }
        if (empty($end)) {
            $end = "$thisYear-12-31 23:59:59";
        }

        $this->_startDate = new \DateTime($start);
        $this->_endDate = new \DateTime($end);

        return $this;
    }

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'is_confirmed',
        'location',
        'is_billable',
    ];
}
