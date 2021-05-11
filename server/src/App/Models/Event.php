<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Robert2\API\Config\Config;
use Robert2\API\Models\Material;
use Robert2\API\Models\Park;
use Robert2\API\Models\Traits\WithPdf;
use Robert2\Lib\Domain\EventData;
use Robert2\API\Validation\Validator as V;

class Event extends BaseModel
{
    use SoftDeletes;
    use WithPdf;

    protected $orderField = 'start_date';

    protected $_startDate;
    protected $_endDate;

    protected $allowedSearchFields = ['title', 'start_date', 'end_date', 'location'];
    protected $searchField = 'title';

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
            'reference'    => V::oneOf(V::nullType(), V::alnum('.,-/_ ')->length(1, 64)),
            'start_date'   => V::notEmpty()->date(),
            'end_date'     => V::callback([$this, 'checkEndDate']),
            'is_confirmed' => V::notOptional()->boolType(),
            'location'     => V::optional(V::length(2, 64)),
            'is_billable'  => V::optional(V::boolType()),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkEndDate($value)
    {
        $dateChecker = V::notEmpty()->date();
        if (!$dateChecker->validate($value)) {
            return false;
        }

        if (!$dateChecker->validate($this->start_date)) {
            return true;
        }

        $startDate = new \DateTime($this->start_date);
        $endDate = new \DateTime($this->end_date);

        return $startDate < $endDate ?: 'endDateMustBeLater';
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
            ->select(['persons.id', 'first_name', 'last_name', 'phone', 'nickname'])
            ->orderBy('last_name');
    }

    public function Beneficiaries()
    {
        return $this->belongsToMany('Robert2\API\Models\Person', 'event_beneficiaries')
            ->select([
                'persons.id',
                'first_name',
                'last_name',
                'reference',
                'phone',
                'company_id',
                'street',
                'postal_code',
                'locality',
            ])
            ->orderBy('last_name');
    }

    public function Materials()
    {
        $fields = [
            'materials.id',
            'name',
            'description',
            'reference',
            'is_unitary',
            'park_id',
            'category_id',
            'sub_category_id',
            'rental_price',
            'stock_quantity',
            'out_of_order_quantity',
            'replacement_price',
            'is_hidden_on_bill',
            'is_discountable',
        ];

        return $this->belongsToMany('Robert2\API\Models\Material', 'event_materials')
            ->using('Robert2\API\Models\EventMaterial')
            ->withPivot('id', 'quantity')
            ->select($fields);
    }

    public function Bills()
    {
        return $this->hasMany('Robert2\API\Models\Bill')
            ->select(['bills.id', 'number', 'date', 'discount_rate', 'due_amount'])
            ->orderBy('date', 'desc');
    }

    public function Estimates()
    {
        return $this->hasMany('Robert2\API\Models\Estimate')
            ->select(['estimates.id', 'date', 'discount_rate', 'due_amount'])
            ->orderBy('date', 'desc');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'user_id'      => 'integer',
        'reference'    => 'string',
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
        $beneficiaries = $this->Beneficiaries()->get();
        return $beneficiaries ? $beneficiaries->toArray() : null;
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

        $builder = static::orderBy('start_date', 'asc')
            ->where($conditions);

        if ($withDeleted) {
            $builder = $builder->onlyTrashed();
        }

        return $builder;
    }

    public static function getMissingMaterials(int $id): ?array
    {
        $event = static::with('Materials')->find($id);
        if (!$event || empty($event->materials)) {
            return null;
        }

        $eventMaterials = Material::recalcQuantitiesForPeriod(
            $event->materials,
            $event->start_date,
            $event->end_date,
            $id
        );

        $missingMaterials = [];
        foreach ($eventMaterials as $material) {
            $material['missing_quantity'] = $material['pivot']['quantity'] - $material['remaining_quantity'];
            $material['missing_quantity'] = min($material['missing_quantity'], $material['pivot']['quantity']);
            if ($material['missing_quantity'] <= 0) {
                continue;
            }

            $missingMaterials[] = $material;
        }

        return empty($missingMaterials) ? null : array_values($missingMaterials);
    }

    public static function getParks(int $id): ?array
    {
        $event = static::with('Materials')->find($id);
        if (!$event) {
            return null;
        }

        $materialParks = array_map(function ($material) {
            return $material['park_id'];
        }, $event['materials']);

        return array_values(array_unique($materialParks));
    }

    public function getPdfContent(int $id): string
    {
        $event = $this
            ->with('Assignees')
            ->with('Beneficiaries')
            ->with('Materials')
            ->findOrFail($id)
            ->toArray();

        $date = new \DateTime();

        $categories = (new Category())->getAll()->get()->toArray();
        $parks = (new Park())->getAll()->get()->toArray();

        $EventData = new EventData($date, $event, 'summary', $event['user_id']);
        $EventData->setCategories($categories)->setParks($parks);

        $materialDisplayMode = Config::getSettings('eventSummary')['materialDisplayMode'];
        if ($materialDisplayMode === 'sub-categories') {
            $materialList = $EventData->getMaterialBySubCategories(true);
        } elseif ($materialDisplayMode === 'parks' && count($parks) > 1) {
            $materialList = $EventData->getMaterialByParks(true);
        } else {
            $materialList = $EventData->getMaterials();
        }

        $data = [
            'event' => $event,
            'date' => $date,
            'locale' => Config::getSettings('defaultLang'),
            'company' => Config::getSettings('companyData'),
            'currency' => Config::getSettings('currency')['iso'],
            'currencyName' => Config::getSettings('currency')['name'],
            'materialList' => $materialList,
            'materialDisplayMode' => $materialDisplayMode,
            'replacementAmount' => $EventData->getReplacementAmount(),
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

    protected $fillable = [
        'user_id',
        'reference',
        'title',
        'description',
        'start_date',
        'end_date',
        'is_confirmed',
        'location',
        'is_billable',
    ];

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
}
