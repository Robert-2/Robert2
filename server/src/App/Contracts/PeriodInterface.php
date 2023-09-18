<?php
declare(strict_types=1);

namespace Loxya\Contracts;

use Carbon\CarbonImmutable;

interface PeriodInterface
{
    /**
     * Permet d'obtenir, pour les objets référençant une "période", la date de début.
     */
    public function getStartDate(): CarbonImmutable;

    /**
     * Permet d'obtenir, pour les objets référençant une "période", la date de fin.
     */
    public function getEndDate(): CarbonImmutable;
}
