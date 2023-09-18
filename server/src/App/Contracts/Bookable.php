<?php
declare(strict_types=1);

namespace Loxya\Contracts;

use Illuminate\Database\Eloquent\Builder;

interface Bookable
{
    /**
     * Permet de sauvegarder une nouvelle liste de matériel pour le bookable
     * (événement ou réservation) représenté par l'instance courante.
     *
     * @param array $materialsData La nouvelle liste de matériel pour le bookable actuel.
     *
     * @return static L'instance du bookable actualisée.
     */
    public function syncMaterials(array $materialsData): static;

    /**
     * Permet de sauvegarder les données de l'inventaire de retour.
     *
     * @param array $inventoryData Les données de l'inventaire.
     *
     * @return static L'instance du bookable actualisée.
     */
    public function updateReturnInventory(array $inventoryData): static;

    /**
     * Permet de terminer l'inventaire de retour.
     *
     * @return static L'instance du bookable actualisée.
     */
    public function finishReturnInventory(): static;

    /**
     * Permet de définir une période pendant laquelle on veut limiter
     * la recherche des bookables.
     *
     * @param Builder $query
     * @param string|Carbon|PeriodInterface $start
     * @param null|string|Carbon $end (optionnel)
     */
    public function scopeInPeriod(Builder $query, $start, $end = null): Builder;
}
