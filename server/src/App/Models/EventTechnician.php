<?php
declare(strict_types=1);

namespace Loxya\Models;

use Illuminate\Database\Eloquent\Collection;
use Loxya\Contracts\Serializable;
use Loxya\Models\Traits\Serializer;
use Respect\Validation\Validator as V;

/**
 * Technicien mandaté sur un événement.
 *
 * @property-read ?int $id
 * @property-read int $event_id
 * @property-read Event $event
 * @property-read int $technician_id
 * @property-read Technician $technician
 * @property string $start_time
 * @property string $end_time
 * @property string|null $position
 */
final class EventTechnician extends BaseModel implements Serializable
{
    use Serializer;

    // - Types de sérialisation.
    public const SERIALIZE_DEFAULT = 'default';
    public const SERIALIZE_DETAILS = 'details';

    public $timestamps = false;

    protected $withoutAlreadyBusyChecks = false;

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'event_id' => V::custom([$this, 'checkEventId']),
            'technician_id' => V::custom([$this, 'checkTechnicianId']),
            'start_time' => V::custom([$this, 'checkDates']),
            'end_time' => V::custom([$this, 'checkDates']),
            'position' => V::optional(V::length(2, 191)),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkEventId($value)
    {
        // - L'identifiant de l’événement n'est pas encore défini, on skip.
        if (!$this->exists && $value === null) {
            return true;
        }
        return Event::staticExists($value);
    }

    public function checkTechnicianId($value)
    {
        V::notEmpty()->numericVal()->check($value);

        $technician = Technician::find($value);
        if (!$technician) {
            return false;
        }

        return !$this->exists || $this->isDirty('technician_id')
            ? !$technician->trashed()
            : true;
    }

    public function checkDates()
    {
        $dateChecker = V::notEmpty()->dateTime();
        if (!$dateChecker->validate($this->start_time)) {
            return 'invalid-date';
        }

        if (!$dateChecker->validate($this->end_time)) {
            return 'invalid-date';
        }

        $utcTimezone = new \DateTimeZone('UTC');
        $start = new \DateTimeImmutable($this->start_time, $utcTimezone);
        $end = new \DateTimeImmutable($this->end_time, $utcTimezone);

        if ($start > $end) {
            return 'end-date-must-be-later';
        }

        // - Les horaires des techniciens étant en UTC, on passe les dates de
        //   l'événement (qui sont en local time) en UTC aussi pour les comparer.
        $eventStart = (new \DateTimeImmutable($this->event->start_date))->setTimezone($utcTimezone);
        $eventEnd = (new \DateTimeImmutable($this->event->end_date))->setTimezone($utcTimezone);
        if ($start < $eventStart || $end < $eventStart) {
            return 'technician-assignation-before-event';
        }

        // - On ajoute 1 seconde à la fin de l'événement car le technicien peut être
        //   assigné jusqu'à minuit pile (alors que l'événement se termine à 23:59:59)
        $normalizedEventEnd = $eventEnd->add(new \DateInterval('PT1S'));
        if ($start > $eventEnd || $end > $normalizedEventEnd) {
            return 'technician-assignation-after-event';
        }

        $precision = [0, 15, 30, 45];
        $startMinutes = (int) $start->format('i');
        $endMinutes = (int) $end->format('i');
        if (!in_array($startMinutes, $precision, true) || !in_array($endMinutes, $precision, true)) {
            return 'date-precision-must-be-quarter';
        }

        if ($this->withoutAlreadyBusyChecks) {
            return true;
        }

        $technicianHasOtherEvents = static::where('id', '!=', $this->id)
            ->where('technician_id', $this->technician_id)
            ->where([
                ['end_time', '>', $this->start_time],
                ['start_time', '<', $this->end_time],
            ])
            ->whereRelation('event', 'deleted_at', null)
            ->exists();
        if ($technicianHasOtherEvents) {
            return 'technician-already-busy-for-this-period';
        }

        return true;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id')
            ->withTrashed();
    }

    public function technician()
    {
        return $this->belongsTo(Technician::class, 'technician_id')
            ->withTrashed();
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $appends = [
        'technician',
    ];

    protected $casts = [
        'event_id' => 'integer',
        'technician_id' => 'integer',
        'start_time' => 'string',
        'end_time' => 'string',
        'position' => 'string',
    ];

    public function getTechnicianAttribute()
    {
        return $this->getRelationValue('technician');
    }

    public function getEventAttribute()
    {
        return $this->getRelationValue('event');
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'event_id',
        'technician_id',
        'start_time',
        'end_time',
        'position',
    ];

    public function setPositionAttribute($value): void
    {
        $value = is_string($value) ? trim($value) : $value;
        $this->attributes['position'] = $value;
    }

    /**
     * Permet d'ignorer la validation qui vérifie le chevauchement avec les dates des autres assignations.
     * Utile quand on est certain que les autres assignations vont être supprimées avant le save
     * (voir static::flushForEvent). À chaîner avec un ->validate().
     */
    public function withoutAlreadyBusyChecks(): self
    {
        $this->withoutAlreadyBusyChecks = true;
        return $this;
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes de "repository"
    // -
    // ------------------------------------------------------

    /**
     * @param Collection|EventTechnician[] $eventTechnicians
     * @param \DateTime $prevStartDate
     * @param array $newEventData
     *
     * @return array
     */
    public static function getForNewDates(
        Collection $eventTechnicians,
        \DateTime $prevStartDate,
        array $newEventData
    ): array {
        $offsetInterval = $prevStartDate->diff(new \DateTime($newEventData['start_date']));

        // - Les horaires des techniciens étant en UTC, on passe les dates de
        //   l'événement (qui sont en local time) en UTC aussi pour les comparer.
        $utcTimezone = new \DateTimeZone('UTC');
        $eventStart = (new \DateTimeImmutable($newEventData['start_date']))->setTimezone($utcTimezone);
        $eventEnd = (new \DateTimeImmutable($newEventData['end_date']))->setTimezone($utcTimezone);

        $technicians = [];
        foreach ($eventTechnicians as $eventTechnician) {
            $technicianStartTime = roundDate(
                (new \DateTime($eventTechnician->start_time, $utcTimezone))->add($offsetInterval)
            );
            $technicianEndTime = roundDate(
                (new \DateTime($eventTechnician->end_time, $utcTimezone))->add($offsetInterval)
            );

            if ($technicianStartTime > $eventEnd) {
                continue;
            }
            if ($technicianEndTime < $eventStart) {
                continue;
            }
            if ($technicianStartTime < $eventStart) {
                $technicianStartTime = $eventStart;
            }
            if ($technicianEndTime >= $eventEnd) {
                // - On ajoute 1 seconde à la fin de l'événement car le technicien doit
                //   être assigné à minuit pile et non à 23:59:59 comme l'événement.
                $technicianEndTime = clone($eventEnd)->add(new \DateInterval('PT1S'));
            }

            $technicians[] = [
                'id' => $eventTechnician->technician_id,
                'start_time' => $technicianStartTime->format('Y-m-d H:i:s'),
                'end_time' => $technicianEndTime->format('Y-m-d H:i:s'),
                'position' => $eventTechnician->position,
            ];
        }

        return $technicians;
    }

    public static function flushForEvent(int $eventId): void
    {
        static::where('event_id', $eventId)->delete();
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(string $format = self::SERIALIZE_DEFAULT): array
    {
        $eventTechnician = tap(clone $this, function (EventTechnician $eventTechnician) use ($format) {
            if ($format === self::SERIALIZE_DETAILS) {
                $eventTechnician->append('event');
            }
        });

        return $eventTechnician->attributesForSerialization();
    }
}
