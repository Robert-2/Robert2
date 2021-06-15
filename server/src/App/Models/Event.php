<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Robert2\API\Config\Config;
use Robert2\API\Models\Material;
use Robert2\API\Models\MaterialUnit;
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
            'user_id' => V::optional(V::numeric()),
            'title' => V::notEmpty()->length(2, 191),
            'description' => V::optional(V::length(null, 255)),
            'reference' => V::oneOf(V::nullType(), V::alnum('.,-/_ ')->length(1, 64)),
            'start_date' => V::notEmpty()->date(),
            'end_date' => V::callback([$this, 'checkEndDate']),
            'is_confirmed' => V::notOptional()->boolType(),
            'is_archived' => V::callback([$this, 'checkIsArchived']),
            'location' => V::optional(V::length(2, 64)),
            'is_billable' => V::optional(V::boolType()),
            'is_return_inventory_done' => V::optional(V::boolType()),
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

    public function checkIsArchived($value)
    {
        if (!$value) {
            return true;
        }

        $boolChecker = V::notOptional()->boolType();
        if (!$boolChecker->validate($value)) {
            return false;
        }

        $dateChecker = V::notEmpty()->date();
        if (!$dateChecker->validate($this->end_date)) {
            return false;
        }

        $now = new \DateTime();
        $endDate = new \DateTime($this->end_date);
        $isPastAndInventoryDone = $endDate < $now && (bool)$this->is_return_inventory_done;

        return $isPastAndInventoryDone ?: 'eventCannotBeArchived';
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
            ->using('Robert2\API\Models\EventAssignee')
            ->withPivot('id', 'position')
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
            ->withPivot('id', 'quantity', 'quantity_returned', 'quantity_broken')
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
        'user_id' => 'integer',
        'reference' => 'string',
        'title' => 'string',
        'description' => 'string',
        'start_date' => 'string',
        'end_date' => 'string',
        'is_confirmed' => 'boolean',
        'is_archived' => 'boolean',
        'location' => 'string',
        'is_billable' => 'boolean',
        'is_return_inventory_done' => 'boolean',
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
            $availableQuantity = $material['remaining_quantity'];
            if ($material['is_unitary']) {
                $availableQuantity = 0;
                foreach ($material['pivot']['units'] as $unitId) {
                    $unit = MaterialUnit::find($unitId);
                    if ($unit && !$unit->is_lost) {
                        $availableQuantity += 1;
                    }
                }
            }

            $material['missing_quantity'] = $material['pivot']['quantity'] - $availableQuantity;
            $material['missing_quantity'] = min($material['missing_quantity'], $material['pivot']['quantity']);

            if ($material['missing_quantity'] <= 0) {
                continue;
            }

            $missingMaterials[] = $material;
        }

        return empty($missingMaterials) ? null : array_values($missingMaterials);
    }

    public static function hasNotReturnedMaterials(int $id): bool
    {
        $event = static::with('Materials')->find($id);
        if (!$event || empty($event->materials) || !$event->is_return_inventory_done) {
            return false;
        }

        $hasNotReturnedMaterials = false;
        foreach ($event->materials as $material) {
            $missing = $material['pivot']['quantity'] - $material['pivot']['quantity_returned'];
            if ($missing > 0) {
                $hasNotReturnedMaterials = true;
            }
        }

        return $hasNotReturnedMaterials;
    }

    public static function getParks(int $id): array
    {
        $event = static::with('Materials')->find($id);
        if (!$event) {
            return [];
        }

        $materialParks = [];
        foreach ($event['materials'] as $material) {
            if ($material['is_unitary']) {
                foreach ($material['units'] as $unit) {
                    $materialParks[] = $unit['park_id'];
                };
                continue;
            }
            $materialParks[] = $material['park_id'];
        };

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

        $materialDisplayMode = Setting::getWithKey('event_summary_material_display_mode');
        if ($materialDisplayMode === 'sub-categories') {
            $materialList = $EventData->getMaterialBySubCategories(true);
        } elseif ($materialDisplayMode === 'parks' && count($parks) > 1) {
            $materialList = $EventData->getMaterialByParks(true);
        } else {
            $materialList = $EventData->getMaterialsFlat(true);
        }

        $customTextTitle = Setting::getWithKey('event_summary_custom_text_title');
        $customText = Setting::getWithKey('event_summary_custom_text');

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
            'customTextTitle' => $customTextTitle,
            'customText' => $customText,
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

    /**
     * Permet de récuperer les ids des unités utilisées pendant l'événement
     * représenté par l'instance courante.
     *
     * Seules les unités utilisées dans les autres événements au même moment
     * seront récuprées, et non pas celles utilisées par l'événement lui-même.
     *
     * @return array - La liste d'unités utilisées au même moment que l'événement.
     */
    public function getConcurrentlyUsedUnits(): array
    {
        $events = (new static())
            ->setPeriod($this->start_date, $this->end_date)
            ->getAll()
            ->with('Materials');

        if ($this->exists) {
            $events = $events->where('id', '!=', $this->id);
        }

        $usedUnits = [];
        foreach ($events->get() as $event) {
            foreach ($event->materials as $material) {
                $usedUnits = array_merge($usedUnits, $material['pivot']['units']);
            }
        }

        return array_unique($usedUnits);
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
        'is_archived',
        'location',
        'is_billable',
        'is_return_inventory_done',
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
