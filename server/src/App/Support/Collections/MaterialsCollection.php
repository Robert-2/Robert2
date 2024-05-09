<?php
declare(strict_types=1);

namespace Loxya\Support\Collections;

use Illuminate\Support\Collection;
use Loxya\Models\EstimateMaterial;
use Loxya\Models\EventMaterial;
use Loxya\Models\InvoiceMaterial;
use Loxya\Models\Material;

class MaterialsCollection extends Collection
{
    public const GLOBAL_LIST = '__global__';

    /**
     * Trie une collection de matériel par catégorie.
     *
     * @return Collection Une nouvelle collection avec les catégories en clé
     */
    public function byCategories(): Collection
    {
        return $this
            ->mapToGroups(function ($entity) {
                $this->_checkItemInstance($entity);

                /** @var Material $material */
                $material = !($entity instanceof Material)
                    ? $entity->material
                    : $entity;

                $category = $material?->category?->name ?? '__other';
                return [$category => $entity];
            })
            ->sortKeys();
    }

    /**
     * Trie une collection de materiel par sous-catégorie.
     *
     * @return Collection Une nouvelle collection avec les sous-catégories en clé
     */
    public function bySubCategories(): Collection
    {
        return $this
            ->mapToGroups(function ($entity) {
                $this->_checkItemInstance($entity);

                /** @var Material $material */
                $material = !($entity instanceof Material)
                    ? $entity->material
                    : $entity;

                $category = $material?->category?->name;
                if (!$category) {
                    return ['--' => $entity];
                }

                $subCategory = $material?->subCategory?->name ?? '__other';
                return [sprintf('%s - %s', $category, $subCategory) => $entity];
            })
            ->sortKeys();
    }

    /**
     * Trie une collection de materiel par parc.
     *
     * @return Collection Une nouvelle collection avec les parcs en clé
     */
    public function byParks(): Collection
    {
        $byParks = new Collection();
        foreach ($this->items as $entity) {
            $this->_checkItemInstance($entity);

            /** @var Material $material */
            $material = !($entity instanceof Material)
                ? $entity->material
                : $entity;

            $parkName = $material?->park?->name;

            if (!$byParks->has($parkName)) {
                $byParks->put($parkName, new MaterialsCollection());
            }

            /** @var MaterialsCollection $parkMaterials */
            $parkMaterials = $byParks->get($parkName);
            $parkMaterials->push($entity);
        }

        return (new Collection($byParks))->sortKeys();
    }

    // ------------------------------------------------------
    // -
    // -     Méthodes internes
    // -
    // ------------------------------------------------------

    protected function _checkItemInstance($material): void
    {
        if (
            !$material instanceof Material &&
            !$material instanceof EventMaterial &&
            !$material instanceof InvoiceMaterial &&
            !$material instanceof EstimateMaterial
        ) {
            throw new \RuntimeException(sprintf(
                "Material instance of `%s` not supported.",
                $material::class,
            ));
        }
    }
}
