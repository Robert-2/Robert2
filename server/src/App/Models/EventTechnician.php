<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Validation\Validator as V;

class EventTechnician extends BaseModel
{
    public $timestamps = false;

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'start_time' => V::callback([$this, 'checkDates']),
            'end_time' => V::callback([$this, 'checkDates']),
            'position' => V::optional(V::length(2, 191)),
        ];
    }

    public function checkDates()
    {
        $dateChecker = V::notEmpty()->date();
        if (!$dateChecker->validate($this->start_time)) {
            return false;
        }

        if (!$dateChecker->validate($this->end_time)) {
            return false;
        }

        $start = new \DateTime($this->start_time);
        $end = new \DateTime($this->end_time);

        if ($start > $end) {
            return 'end-date-must-be-later';
        }

        $eventStart = new \DateTime($this->event->start_date);
        $eventEnd = new \DateTime($this->event->end_date);
        if ($start < $eventStart || $end < $eventStart) {
            return 'technician-assignation-before-event';
        }
        if ($start > $eventEnd || $end > $eventEnd) {
            return 'technician-assignation-after-event';
        }

        $technicianHasOtherEvents = static::where('id', '!=', $this->id)
            ->where('technician_id', $this->technician_id)
            ->where([
                ['end_time', '>=', $this->start_time],
                ['start_time', '<=', $this->end_time],
            ])
            ->exists();
        if ($technicianHasOtherEvents) {
            return 'technician-already-busy-for-this-period';
        }

        return true;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = [
        'technician',
    ];

    public function Event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function Technician()
    {
        return $this->belongsTo(Person::class, 'technician_id')
            ->select(['id', 'first_name', 'last_name', 'nickname', 'phone']);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'event_id' => 'integer',
        'technician_id' => 'integer',
        'start_time' => 'string',
        'end_time' => 'string',
        'position' => 'string',
    ];

    public function getEventAttribute()
    {
        return $this->Event()->first();
    }

    public function getTechnicianAttribute()
    {
        return $this->Technician()->first();
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public static function getForNewDates(array $eventTechnicians, \DateTime $prevStartDate, array $newEventData): array
    {
        $newStartDate = new \DateTime($newEventData['start_date']);
        $newEndDate = new \DateTime($newEventData['end_date']);
        $offsetInterval = $prevStartDate->diff($newStartDate);

        $technicians = [];
        foreach ($eventTechnicians as $technician) {
            $technicianStartTime = (new \DateTime($technician['start_time']))->add($offsetInterval);
            $technicianEndTime = (new \DateTime($technician['end_time']))->add($offsetInterval);

            if ($technicianStartTime > $newEndDate) {
                continue;
            }
            if ($technicianEndTime < $newStartDate) {
                continue;
            }
            if ($technicianStartTime < $newStartDate) {
                $technicianStartTime = $newStartDate;
            }
            if ($technicianEndTime > $newEndDate) {
                $technicianEndTime = $newEndDate;
            }

            $technicians[] = [
                'id' => $technician['technician_id'],
                'start_time' => $technicianStartTime->format('Y-m-d H:i:s'),
                'end_time' => $technicianEndTime->format('Y-m-d H:i:s'),
                'position' => $technician['position'],
            ];
        }

        return $technicians;
    }


    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'event_id',
        'technician_id',
        'start_time',
        'end_time',
        'position',
    ];

    public function setPositionAttribute($value)
    {
        $value = is_string($value) ? trim($value) : $value;
        $this->attributes['position'] = $value;
    }

    public static function flushForEvent(int $eventId)
    {
        static::where('event_id', $eventId)->delete();
    }
}
