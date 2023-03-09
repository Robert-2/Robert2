<?php
declare(strict_types=1);

namespace Robert2\Support;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Robert2\API\Contracts\PeriodInterface;

final class Period implements PeriodInterface
{
    private $rawPeriod;

    public function __construct($start, $end = null)
    {
        if ($start instanceof PeriodInterface) {
            $end = clone $start->getEndDate();
            $start = clone $start->getStartDate();
        }

        if ($end === null) {
            throw new \InvalidArgumentException('Missing end for the period.');
        }

        $this->rawPeriod = new CarbonPeriod($start, $end);
    }

    public function getStartDate(): Carbon
    {
        return $this->rawPeriod->getStartDate();
    }

    public function getEndDate(): Carbon
    {
        return $this->rawPeriod->getEndDate();
    }

    /**
     * Vérifie si la période courante "contient" une autre période.
     *
     * @param PeriodInterface $otherPeriod L'autre période à comparer.
     */
    public function contain(PeriodInterface $otherPeriod): bool
    {
        return (
            $this->getStartDate() <= $otherPeriod->getStartDate() &&
            $this->getEndDate() >= $otherPeriod->getEndDate()
        );
    }

    /**
     * Vérifie si la période courante "chevauche" une autre période.
     *
     * @param PeriodInterface $otherPeriod L'autre période à comparer.
     */
    public function overlaps(PeriodInterface $otherPeriod): bool
    {
        return (
            $this->getStartDate() <= $otherPeriod->getEndDate() &&
            $this->getEndDate() >= $otherPeriod->getStartDate()
        );
    }

    /**
     * Fusionne la période courante avec une autre et retourne la période résultante.
     *
     * @param PeriodInterface $otherPeriod La période avec laquelle il faut fusionner.
     */
    public function merge(PeriodInterface $otherPeriod): self
    {
        $startDate = $this->getStartDate() <= $otherPeriod->getStartDate()
            ? $this->getStartDate()
            : $otherPeriod->getStartDate();

        $endDate = $this->getEndDate() >= $otherPeriod->getEndDate()
            ? $this->getEndDate()
            : $otherPeriod->getEndDate();

        return new static($startDate, $endDate);
    }
}
