<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\QueryException;
use Robert2\API\Config\Config;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Traits\Cache;
use Robert2\API\Models\Traits\JsonSerializer;
use Robert2\API\Models\Traits\WithPdf;
use Robert2\API\Validation\Validator as V;
use Robert2\Lib\Domain\EventData;
use Symfony\Contracts\Cache\ItemInterface as CacheItemInterface;

/**
 * Modèle Event.
 *
 * @method static Builder inPeriod(Builder $query, string|DateTime $start, string|DateTime|null $end)
 */
class Event extends BaseModel
{
    use JsonSerializer;
    use SoftDeletes;
    use WithPdf;
    use Cache;

    protected $orderField = 'start_date';

    protected $allowedSearchFields = ['title', 'start_date', 'end_date', 'location'];
    protected $searchField = 'title';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->pdfTemplate = 'event-summary-default';

        $this->validation = [
            'user_id' => V::optional(V::numeric()),
            'title' => V::notEmpty()->length(2, 191),
            'reference' => V::oneOf(V::nullType(), V::alnum('.,-/_ ')->length(1, 64)),
            'start_date' => V::notEmpty()->date(),
            'end_date' => V::callback([$this, 'checkEndDate']),
            'is_confirmed' => V::notOptional()->boolType(),
            'is_archived' => V::callback([$this, 'checkIsArchived']),
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
        return $this->belongsTo(User::class)
            ->select(['users.id', 'pseudo', 'email', 'group_id']);
    }

    public function Technicians()
    {
        return $this->hasMany(EventTechnician::class, 'event_id')
            ->orderBy('start_time');
    }

    public function Beneficiaries()
    {
        return $this->belongsToMany(Person::class, 'event_beneficiaries')
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

        return $this->belongsToMany(Material::class, 'event_materials')
            ->using(EventMaterial::class)
            ->withPivot('id', 'quantity', 'quantity_returned', 'quantity_broken')
            ->select($fields);
    }

    public function Bills()
    {
        return $this->hasMany(Bill::class)
            ->select(['bills.id', 'number', 'date', 'discount_rate', 'due_amount'])
            ->orderBy('date', 'desc');
    }

    public function Estimates()
    {
        return $this->hasMany(Estimate::class)
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

    public function getHasMissingMaterialsAttribute()
    {
        if (!$this->exists || $this->is_archived) {
            return null;
        }

        $today = (new \DateTime())->setTime(0, 0, 0);
        $eventEndDate = new \DateTime($this->end_date);

        if ($eventEndDate < $today) {
            return null;
        }

        return $this->cacheGet(
            'has_missing_materials',
            function (?CacheItemInterface $cacheItem) {
                if ($cacheItem) {
                    $cacheItem->expiresAfter(new \DateInterval('P1D'));
                }
                return !empty($this->missingMaterials());
            }
        );
    }

    public function getHasNotReturnedMaterialsAttribute()
    {
        if (!$this->exists || $this->is_archived) {
            return null;
        }

        $today = (new \DateTime())->setTime(0, 0, 0);
        $eventEndDate = new \DateTime($this->end_date);

        if ($eventEndDate >= $today || !$this->is_return_inventory_done) {
            return null;
        }

        return $this->cacheGet(
            'has_not_returned_materials',
            function (?CacheItemInterface $cacheItem) {
                if ($cacheItem) {
                    $cacheItem->expiresAfter(new \DateInterval('P1D'));
                }

                if (empty($this->materials)) {
                    return false;
                }

                foreach ($this->materials as $material) {
                    $missing = $material['pivot']['quantity'] - $material['pivot']['quantity_returned'];
                    if ($missing > 0) {
                        return true;
                    }
                }

                return false;
            }
        );
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(bool $withDeleted = false): Builder
    {
        $builder = static::inPeriod('first day of this year', 'last day of this year');

        if ($withDeleted) {
            $builder = $builder->onlyTrashed();
        }

        return $builder;
    }

    public function missingMaterials(): ?array
    {
        if (empty($this->materials)) {
            return null;
        }

        $eventMaterials = Material::recalcQuantitiesForPeriod(
            $this->materials,
            $this->start_date,
            $this->end_date,
            $this->exists ? $this->id : null,
        );

        $missingMaterials = [];
        foreach ($eventMaterials as $material) {
            $material['missing_quantity'] = $material['pivot']['quantity'] - $material['remaining_quantity'];
            $material['missing_quantity'] = min($material['missing_quantity'], $material['pivot']['quantity']);
            if ($material['missing_quantity'] > 0) {
                $missingMaterials[] = $material;
            }
        }

        return !empty($missingMaterials)
            ? array_values($missingMaterials)
            : null;
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

        $materialDisplayMode = Setting::getWithKey('eventSummary.materialDisplayMode');
        if ($materialDisplayMode === 'categories') {
            $materialList = $EventData->getMaterialByCategories(true);
        } elseif ($materialDisplayMode === 'sub-categories') {
            $materialList = $EventData->getMaterialBySubCategories(true);
        } elseif ($materialDisplayMode === 'parks' && count($parks) > 1) {
            $materialList = $EventData->getMaterialByParks(true);
        } else {
            $materialList = $EventData->getMaterialsFlat(true);
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
            'technicians' => $EventData->getTechnicians(),
            'customText' => Setting::getWithKey('eventSummary.customText'),
            'showLegalNumbers' => Setting::getWithKey('eventSummary.showLegalNumbers'),
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

    // ------------------------------------------------------
    // -
    // -    Query Scopes
    // -
    // ------------------------------------------------------

    /**
     * @param Builder              $query
     * @param string|DateTime      $start
     * @param null|string|DateTime $end (optional)
     *
     * @return Builder
     */
    public function scopeInPeriod(Builder $query, $start, $end = null): Builder
    {
        // - Si pas de date de fin: Période d'une journée.
        $end = $end ?? $start;

        if (!$start instanceof \DateTime) {
            $start = new \DateTime($start);
        }
        if (!$end instanceof \DateTime) {
            $end = new \DateTime($end);
        }

        return $query
            ->orderBy('start_date', 'asc')
            ->where(function (Builder $query) use ($start, $end) {
                $query->where([
                    ['end_date', '>=', $start->format('Y-m-d 00:00:00')],
                    ['start_date', '<=', $end->format('Y-m-d 23:59:59')],
                ]);
            });
    }
}
