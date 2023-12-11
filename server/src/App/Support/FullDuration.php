<?php
declare(strict_types=1);

namespace Loxya\Support;

use Illuminate\Contracts\Support\Arrayable;
use Loxya\Contracts\PeriodInterface;

final class FullDuration implements Arrayable
{
    protected PeriodInterface $period;

    public function __construct(PeriodInterface $period)
    {
        $this->period = $period;
    }

    public function getDays(): int
    {
        $startDate = $this->period->getStartDate()->startOfDay();
        $endDate = $this->period->getEndDate();
        if ($endDate->format('H:i:s') !== '00:00:00') {
            $endDate = $endDate
                ->add(new \DateInterval('P1D'))
                ->startOfDay();
        }
        return max($startDate->diffInDays($endDate), 1);
    }

    public function getHours(): int
    {
        $startDate = $this->period->getStartDate()->startOfHour();
        $endDate = $this->period->getEndDate();
        if ($endDate->format('i:s') !== '00:00') {
            $endDate = $endDate
                ->add(new \DateInterval('PT1H'))
                ->startOfHour();
        }
        return max($startDate->diffInHours($endDate), 1);
    }

    public function toArray()
    {
        return [
            'days' => $this->getDays(),
            'hours' => $this->getHours(),
        ];
    }
}
