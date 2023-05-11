<?php
declare(strict_types=1);

namespace Robert2\API\Contracts;

use Illuminate\Database\Eloquent\Builder;

interface Bookable
{
    /**
     * Permet de sauvegarder une nouvelle liste de matériel pour le bookable (événement ou réservation)
     * représenté par l'instance courante.
     *
     * @param array $materialsData La nouvelle liste de matériel pour le bookable actuel.
     */
    public function syncMaterials(array $materialsData): void;

    /**
     * Permet de définir une période pendant laquelle on veut limiter la recherche des bookables.
     *
     * @param Builder $query
     * @param string|Carbon|PeriodInterface $start
     * @param null|string|Carbon $end (optionnel)
     *
     * @return Builder
     */
    public function scopeInPeriod(Builder $query, $start, $end = null): Builder;
}
