<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Robert2\API\Config\Config;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Material;
use Robert2\API\Models\Park;
use Robert2\API\Models\Traits\JsonSerializer;
use Robert2\API\Models\Traits\WithPdf;
use Robert2\Lib\Domain\EventData;
use Robert2\API\Validation\Validator as V;

class Event extends BaseModel
{
    use JsonSerializer;
    use SoftDeletes;
    use WithPdf;

    protected $orderField = 'start_date';

    protected $_searchStartDate;
    protected $_searchEndDate;

    protected $allowedSearchFields = ['title', 'start_date', 'end_date', 'location'];
    protected $searchField = 'title';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->pdfTemplate = 'event-summary-default';

        $thisYear = date('Y');
        $this->_searchStartDate = new \DateTime("$thisYear-01-01");
        $this->_searchEndDate = new \DateTime("$thisYear-12-31");

        $this->validation = [
            'user_id' => V::optional(V::numeric()),
            'title' => V::notEmpty()->length(2, 191),
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

        return $startDate < $endDate ?: 'end-date-must-be-later';
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

        return $isPastAndInventoryDone ?: 'event-cannot-be-archived';
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

    public function Technicians()
    {
        return $this->hasMany(EventTechnician::class, 'event_id')
            ->orderBy('start_time');
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

    public function getTechniciansAttribute()
    {
        $technicians = $this->Technicians()->get();
        return $technicians ? $technicians->toArray() : null;
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
        $start = $this->_searchStartDate->format('Y-m-d H:i:s');
        $end = $this->_searchEndDate->format('Y-m-d H:i:s');

        $conditions = function (Builder $query) use ($start, $end) {
            $query
                ->where([
                    ['end_date', '>=', $start],
                    ['start_date', '<=', $end],
                ]);
        };

        $builder = static::orderBy('start_date', 'asc')
            ->where($conditions);

        if ($withDeleted) {
            $builder = $builder->onlyTrashed();
        }

        return $builder;
    }

    public static function getOngoing(): Builder
    {
        $now = date('Y-m-d H:i:s');

        return static::orderBy('start_date', 'asc')
            ->where([
                ['end_date', '>=', $now],
                ['start_date', '<=', $now],
            ]);
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

        $materialParks = array_map(function ($material) {
            return $material['park_id'];
        }, $event['materials']);

        return array_values(array_unique($materialParks));
    }

    public function getPdfContent(int $id): string
    {
        $event = $this
            ->with('Technicians')
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
        if ($materialDisplayMode === 'categories') {
            $materialList = $EventData->getMaterialByCategories(true);
        } elseif ($materialDisplayMode === 'sub-categories') {
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
            'technicians' => $EventData->getTechnicians(),
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

    public function setReferenceAttribute($value)
    {
        $value = is_string($value) ? trim($value) : $value;
        $this->attributes['reference'] = $value;
    }

    public static function staticEdit($id = null, array $data = []): BaseModel
    {
        if ($id && !static::staticExists($id)) {
            throw (new ModelNotFoundException)
                ->setModel(get_class(), $id);
        }

        try {
            $event = static::firstOrNew(compact('id'));

            $originalStartDate = $event->getOriginal('start_date');
            $originalEndDate = $event->getOriginal('end_date');

            $data = cleanEmptyFields($data);
            $data = $event->_trimStringFields($data);

            $event->fill($data)->validate()->save();

            if (isset($data['beneficiaries'])) {
                if (!is_array($data['beneficiaries'])) {
                    throw new \InvalidArgumentException("Key 'beneficiaries' must be an array.");
                }
                $event->syncBeneficiaries($data['beneficiaries']);
            }

            $technicians = null;
            if (isset($data['technicians'])) {
                if (!is_array($data['technicians'])) {
                    throw new \InvalidArgumentException("Key 'technicians' must be an array.");
                }
                $technicians = $data['technicians'];
            } elseif (!empty($originalStartDate) && (
                $originalStartDate !== $event->start_date ||
                $originalEndDate !== $event->end_date
            )) {
                $technicians = EventTechnician::getForNewDates(
                    $event->technicians,
                    new \DateTime($originalStartDate),
                    ['start_date' => $event->start_date, 'end_date' => $event->end_date]
                );
            }
            if ($technicians) {
                $event->syncTechnicians($technicians);
            }

            if (isset($data['materials'])) {
                if (!is_array($data['materials'])) {
                    throw new \InvalidArgumentException("Key 'materials' must be an array.");
                }
                $event->syncMaterials($data['materials']);
            }
        } catch (QueryException $e) {
            throw (new ValidationException)
                ->setPDOValidationException($e);
        }

        return $event->refresh();
    }

    public function syncBeneficiaries(array $beneficiariesIds)
    {
        $this->Beneficiaries()->sync($beneficiariesIds);
    }

    public function syncTechnicians(array $techniciansData)
    {
        $errors = [];
        $technicians = [];
        foreach ($techniciansData as $technicianData) {
            try {
                $eventTechnician = new EventTechnician([
                    'event_id' => $this->id,
                    'technician_id' => $technicianData['id'],
                    'start_time' => $technicianData['start_time'],
                    'end_time' => $technicianData['end_time'],
                    'position' => $technicianData['position'],
                ]);
                $technicians[] = $eventTechnician->withoutAlreadyBusyChecks()->validate();
            } catch (ValidationException $e) {
                $errors[$technicianData['id']] = $e->getValidationErrors();
            }
        }

        if (!empty($errors)) {
            throw (new ValidationException())
                ->setValidationErrors($errors);
        }

        EventTechnician::flushForEvent($this->id);
        $this->Technicians()->saveMany($technicians);
    }

    public function syncMaterials(array $materialsData)
    {
        $materials = [];
        foreach ($materialsData as $material) {
            if ((int)$material['quantity'] <= 0) {
                continue;
            }

            $materials[$material['id']] = [
                'quantity' => $material['quantity']
            ];
        }

        $this->Materials()->sync($materials);
    }

    public function setSearchPeriod(?string $start, ?string $end): Event
    {
        $thisYear = date('Y');
        if (empty($start)) {
            $start = "$thisYear-01-01 00:00:00";
        }
        if (empty($end)) {
            $end = "$thisYear-12-31 23:59:59";
        }

        $this->_searchStartDate = new \DateTime($start);
        $this->_searchEndDate = new \DateTime($end);

        return $this;
    }

    public static function duplicate(int $originalId, array $newEventData): BaseModel
    {
        $originalEvent = static::findOrFail($originalId);

        $newEvent = new self([
            'user_id' => $newEventData['user_id'] ?? null,
            'title' => $originalEvent->title,
            'description' => $originalEvent->description,
            'start_date' => $newEventData['start_date'] ?? null,
            'end_date' => $newEventData['end_date'] ?? null,
            'is_confirmed' => false,
            'is_archived' => false,
            'location' => $originalEvent->location,
            'is_billable' => $originalEvent->is_billable,
            'is_return_inventory_done' => false,
        ]);
        $newEvent->validate();

        $beneficiaries = array_column($originalEvent->beneficiaries, 'id');

        $technicians = EventTechnician::getForNewDates(
            $originalEvent->technicians,
            new \DateTime($originalEvent->start_date),
            $newEventData
        );

        $materials = array_map(function ($material) {
            return [
                'id' => $material['id'],
                'quantity' => $material['pivot']['quantity'],
            ];
        }, $originalEvent->materials);

        $newEvent->save();
        $newEvent->syncBeneficiaries($beneficiaries);
        $newEvent->syncTechnicians($technicians);
        $newEvent->syncMaterials($materials);

        return $newEvent;
    }
}
