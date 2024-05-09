<?php
declare(strict_types=1);

namespace Loxya\Contracts;

use Carbon\CarbonImmutable;

interface PeriodInterface
{
    /**
     * Permet d'obtenir, pour les objets référençant une "période", la date de début.
     *
     * @return CarbonImmutable La date de début de la période représentée.
     */
    public function getStartDate(): CarbonImmutable;

    /**
     * Permet d'obtenir, pour les objets référençant une "période", la date de fin.
     *
     * @return CarbonImmutable La date de fin de la période représentée.
     */
    public function getEndDate(): CarbonImmutable;

    /**
     * Vérifie si la période de l'objet chevauche une période donnée.
     *
     * @param PeriodInterface $period La période à comparer.
     *
     * @return bool `true` si la période de l'objet chevauche la période donnée.
     */
    public function overlaps(PeriodInterface $period): bool;
}
