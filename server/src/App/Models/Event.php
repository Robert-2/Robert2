<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Robert2\API\Config\Config;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Material;
use Robert2\API\Models\Traits\Cache;
use Robert2\API\Models\Traits\Serializer;
use Robert2\API\Models\Traits\WithPdf;
use Robert2\API\Validation\Validator as V;
use Robert2\Lib\Domain\EventData;
use Symfony\Contracts\Cache\ItemInterface as CacheItemInterface;

/**
 * Modèle Event.
 *
 * @method static Builder inPeriod(Builder $query, string|DateTime $start, string|DateTime|null $end)
 */
class Event extends BaseModel implements Serializable
{
    use Serializer;
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
            'reference' => V::callback([$this, 'checkReference']),
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

    public function checkReference($value)
    {
        V::oneOf(
            V::nullType(),
            V::alnum('.,-/_ ')->length(1, 64)
        )->check($value);

        if (!$value) {
            return true;
        }

        $query = static::where('reference', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        if ($query->withTrashed()->exists()) {
            return 'reference-already-in-use';
        }

        return true;
    }

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

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    // TODO: Renommer ça en `author` (et la clé dans la table aussi (`author_id`))
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function technicians()
    {
        return $this->hasMany(EventTechnician::class, 'event_id')
            ->orderBy('start_time');
    }

    public function beneficiaries()
    {
        return $this->belongsToMany(Beneficiary::class, 'event_beneficiaries');
    }

    public function materials()
    {
        return $this->belongsToMany(Material::class, 'event_materials')
            ->using(EventMaterial::class)
            ->withPivot('id', 'quantity', 'quantity_returned', 'quantity_broken');
    }

    public function bills()
    {
        return $this->hasMany(Bill::class)
            ->orderBy('date', 'desc');
    }

    public function estimates()
    {
        return $this->hasMany(Estimate::class)
            ->orderBy('date', 'desc');
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

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

    public function getBeneficiariesAttribute()
    {
        return $this->getRelationValue('beneficiaries')
            ->sortBy('last_name')
            ->values();
    }

    public function getTechniciansAttribute()
    {
        return $this->getRelationValue('technicians');
    }

    public function getUserAttribute()
    {
        return $this->getRelationValue('user');
    }

    public function getMaterialsAttribute()
    {
        return $this->getRelationValue('materials');
    }

    public function getEstimatesAttribute()
    {
        return $this->getRelationValue('estimates');
    }

    public function getBillsAttribute()
    {
        return $this->getRelationValue('bills');
    }

    public function getDailyAmountAttribute(): float
    {
        return (float) $this->materials->sum(fn($material) => (
            $material->rental_price * $material->pivot->quantity
        ));
    }

    public function getDiscountableDailyAmountAttribute(): float
    {
        return (float) $this->materials->sum(function ($material) {
            if (!$material->is_discountable) {
                return 0.0;
            }
            return $material->rental_price * $material->pivot->quantity;
        });
    }

    public function getReplacementAmountAttribute(): float
    {
        return (float) $this->materials->sum(fn($material) => (
            $material->replacement_price * $material->pivot->quantity
        ));
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
                return $this->missingMaterials()->isNotEmpty();
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

                if ($this->materials->isEmpty()) {
                    return false;
                }

                foreach ($this->materials as $material) {
                    $missing = $material->pivot->quantity - $material->pivot->quantity_returned;
                    if ($missing > 0) {
                        return true;
                    }
                }

                return false;
            }
        );
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

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

    // ------------------------------------------------------
    // -
    // -    Entity methods
    // -
    // ------------------------------------------------------

    public function missingMaterials(): Collection
    {
        $materials = Material::withAvailabilities(
            $this->materials,
            $this->start_date,
            $this->end_date,
            $this->exists ? $this->id : null
        );

        return $materials
            ->map(function ($material) {
                $availableQuantity = $material->available_quantity;

                $missingQuantity = $material->pivot->quantity - $availableQuantity;
                $missingQuantity = min($missingQuantity, $material->pivot->quantity);
                $material->missing_quantity = $missingQuantity;

                return $material;
            })
            ->filter(fn($material) => $material->missing_quantity > 0)
            ->values();
    }

    public function syncBeneficiaries(array $beneficiariesIds)
    {
        $this->beneficiaries()->sync($beneficiariesIds);
        $this->refresh();
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
            throw new ValidationException($errors);
        }

        // FIXME: Transaction.
        EventTechnician::flushForEvent($this->id);
        $this->technicians()->saveMany($technicians);
        $this->refresh();
    }

    public function syncMaterials(array $materialsData)
    {
        $materials = [];
        foreach ($materialsData as $materialData) {
            if ((int)$materialData['quantity'] <= 0) {
                continue;
            }

            try {
                $material = Material::findOrFail($materialData['id']);

                $materials[$materialData['id']] = [
                    'quantity' => $materialData['quantity']
                ];
            } catch (ModelNotFoundException $e) {
                throw new \InvalidArgumentException(
                    "One or more materials (or units of them) added to the event do not exist.",
                    ERROR_VALIDATION
                );
            }
        }

        $this->materials()->sync($materials);
        $this->refresh();
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

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
    // -
    // ------------------------------------------------------

    // TODO => Static.
    public function getAll(bool $withDeleted = false): Builder
    {
        $builder = static::inPeriod('first day of this year', 'last day of this year');

        if ($withDeleted) {
            $builder = $builder->onlyTrashed();
        }

        return $builder;
    }

    public static function getParks(int $id): array
    {
        $event = static::with('materials')->find($id);
        if (!$event) {
            return [];
        }

        $materialParks = [];
        foreach ($event->materials as $material) {
            $materialParks[] = $material->park_id;
        };

        return array_values(array_unique($materialParks));
    }

    public function getPdfContent(int $id): string
    {
        $event = static::findOrFail($id);

        // - Date.
        $date = new \DateTimeImmutable();
        if (Config::getEnv() === 'test') {
            $date = new \DateTimeImmutable('2022-09-23');
        }

        $data = (new EventData($event))->toEventPdfData($date);
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
     * Récupère la liste des événements passés depuis un certain nombre de jours,
     * dont l'inventaire de retour n'est pas terminé et qui contient encore du matériel
     * non retourné.
     *
     * @param string $endDate La date à utiliser comme date de fin des événements
     * @param string $minDate La date la plus ancienne à utiliser pour la vérification
     * @param string $mode Soit 'exact' pour les événements d'une date précise, soit 'withPrevious'
     * pour tous les événements avant cette date (default 'exact').
     *
     * @return Builder Le builder du model Event avec les bonnes clauses `where` définies
     */
    public static function getAllNotReturned(string $endDate, string $minDate, string $mode = 'exact'): ?Builder
    {
        if (empty($endDate) || !Carbon::hasFormat($endDate, 'Y-m-d')) {
            throw new \InvalidArgumentException("La date de fin à utiliser n'est pas valide.");
        }
        if (empty($minDate) || !Carbon::hasFormat($minDate, 'Y-m-d')) {
            throw new \InvalidArgumentException("La date minimale à utiliser n'est pas valide.");
        }

        $operator = $mode === 'withPrevious' ? '<=' : '=';

        return static::where('is_return_inventory_done', false)
            ->where('is_archived', false)
            ->whereDate('end_date', $operator, $endDate)
            ->whereDate('end_date', '>', $minDate)
            ->whereHas('materials', function (Builder $query) {
                $query->whereColumn('quantity', '>', 'quantity_returned');
            })
            ->with(['beneficiaries', 'user', 'materials']);
    }

    public static function staticEdit($id = null, array $data = []): BaseModel
    {
        if ($id && !static::staticExists($id)) {
            throw (new ModelNotFoundException)
                ->setModel(get_class(), $id);
        }

        $event = static::firstOrNew(compact('id'));

        $originalStartDate = $event->getOriginal('start_date');
        $originalEndDate = $event->getOriginal('end_date');

        $event->fill($data)->save();

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

        return $event->refresh();
    }

    // TODO => Entity method.
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

        $beneficiaries = $originalEvent->beneficiaries->pluck('id')->all();
        $technicians = EventTechnician::getForNewDates(
            $originalEvent->technicians,
            new \DateTime($originalEvent->start_date),
            $newEventData
        );

        $materials = $originalEvent->materials
            ->map(fn($material) => [
                'id' => $material->id,
                'quantity' => $material->pivot->quantity,
            ])
            ->all();

        $newEvent->save();
        $newEvent->syncBeneficiaries($beneficiaries);
        $newEvent->syncTechnicians($technicians);
        $newEvent->syncMaterials($materials);

        return $newEvent->refresh();
    }

    // ------------------------------------------------------
    // -
    // -    Utils Methods
    // -
    // ------------------------------------------------------

    /**
     * Retourne les données d'un événement formatées pour l'envoi de notifications.
     *
     * @param Event $event Une instance de l'événement à formater.
     *
     * @return array Les données de l'événement formatées pour les notifications.
     */
    public static function formatForNotifications(Event $event): array
    {
        $missingMaterials = [];
        foreach ($event->materials as $material) {
            if ($material->pivot->quantity === $material->pivot->quantity_returned) {
                continue;
            }

            $missingMaterials[] = [
                'id' => $material->id,
                'name' => $material->name,
                'reference' => $material->reference,
                'quantity' => $material->pivot->quantity,
                'quantityReturned' => $material->pivot->quantity_returned,
            ];
        };

        usort($missingMaterials, function ($a, $b) {
            return strcasecmp($a['name'], $b['name']);
        });

        return [
            'id' => $event->id,
            'title' => $event->title,
            'startDate' => $event->start_date,
            'endDate' => $event->end_date,
            'beneficiaries' => $event->beneficiaries->toArray(),
            'manager' => [
                'id' => $event->user_id,
                'email' => $event->user ? $event->user->email : null,
                'name' => $event->user ? $event->user->full_name : null,
                'phone' => $event->user ? $event->user->phone : null,
            ],
            'materialsNotReturnedList' => $missingMaterials,
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(): array
    {
        $data = $this->attributesForSerialization();

        // - On ajoute manuellement le matériel car on veut les données du pivot avec.
        if ($this->hasAppended('materials')) {
            $data['materials'] = $this->materials
                ->map(fn($material) => (
                    array_merge($material->serialize(), [
                        'pivot' => $material->pivot->toArray(),
                    ])
                ))
                ->all();
        }

        unset($data['deleted_at']);

        return $data;
    }
}
