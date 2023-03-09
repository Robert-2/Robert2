<?php
declare(strict_types=1);

namespace Robert2\API\Contracts;

use Carbon\Carbon;

interface PeriodInterface
{
    /**
     * Permet d'obtenir, pour les objets référençant une "période", la date de début.
     *
     * @return Carbon
     */
    public function getStartDate(): Carbon;

    /**
     * Permet d'obtenir, pour les objets référençant une "période", la date de fin.
     *
     * @return Carbon
     */
    public function getEndDate(): Carbon;
}
