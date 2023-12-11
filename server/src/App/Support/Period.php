<?php
declare(strict_types=1);

namespace Loxya\Support;

use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriodImmutable;
use DateTimeInterface;
use Loxya\Contracts\PeriodInterface;
use Respect\Validation\Validator as V;

final class Period implements PeriodInterface
{
    private CarbonPeriodImmutable $rawPeriod;

    public function __construct($start, $end = null)
    {
        if ($start instanceof PeriodInterface) {
            $end = clone $start->getEndDate();
            $start = clone $start->getStartDate();
        }

        if ($end === null) {
            throw new \InvalidArgumentException('Missing end for the period.');
        }

        $rawPeriod = new CarbonPeriodImmutable($start, $end);
        if ($rawPeriod->getStartDate()->isAfter($rawPeriod->getEndDate())) {
            throw new \InvalidArgumentException('End date should be after start date.');
        }

        $this->rawPeriod = $rawPeriod;
    }

    public function getStartDate(): CarbonImmutable
    {
        return $this->rawPeriod->getStartDate();
    }

    public function getEndDate(): CarbonImmutable
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

    // ------------------------------------------------------
    // -
    // -    Helpers
    // -
    // ------------------------------------------------------

    /**
     * Permet de récupérer une période depuis un tableau de dates.
     *
     * @param array $array - Le tableau à convertir en période, deux formats sont acceptés:
     *                       - Soit `['start' => '[Date début]', 'end' => '[Date fin]']`.
     *                       - Soit `['[Date début]', '[Date fin]']`.
     *
     * @return static - La période équivalente aux dates du tableau.
     */
    public static function fromArray(array $array): static
    {
        if (!array_key_exists('start', $array) || !array_key_exists('end', $array)) {
            $keys = array_keys($array);
            if (count($array) !== 2 || !is_numeric($keys[0]) || !is_numeric($keys[1])) {
                throw new \InvalidArgumentException('Missing date part in array.');
            }
            $array = array_combine(['start', 'end'], array_values($array));
        }

        $dateChecker = V::notEmpty()->dateTime();
        foreach (['start', 'end'] as $type) {
            $isValid = (
                $array[$type] instanceof DateTimeInterface ||
                $dateChecker->validate($array[$type])
            );
            if (!$isValid) {
                throw new \InvalidArgumentException(sprintf('Invalid %s date.', $type));
            }
        }

        $start = new Carbon($array['start']);
        if (is_string($array['start']) && date_parse($array['start'])['hour'] === false) {
            $start->startOfDay();
        }

        $end = new Carbon($array['end']);
        if (is_string($array['end']) && date_parse($array['end'])['hour'] === false) {
            $end->setTime(23, 59, 59);
        }

        return new static($start, $end);
    }
}
