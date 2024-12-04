<?php
declare(strict_types=1);

namespace Loxya\Observers;

use Loxya\Models\Attribute;
use Loxya\Models\Enums\AttributeEntity;
use Loxya\Models\Material;

final class AttributeObserver
{
    public $afterCommit = true;

    public function updated(Attribute $attribute): void
    {
        if ($attribute->wasChanged('entities')) {
            $this->handleChangeEntities($attribute);
        }
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    protected function handleChangeEntities(Attribute $attribute): void
    {
        debug(
            "[Event] La caractéristique #%d est maintenant liée aux entités [%s].",
            $attribute->id,
            implode(', ', $attribute->entities),
        );

        //
        // - Si la caractéristique n'est plus liée au matériel,
        //   on supprime les valeurs pour le matériel.
        //

        if (!in_array(AttributeEntity::MATERIAL->value, $attribute->entities, true)) {
            $materials = Material::query()
                ->whereHas('attributes', static fn ($query) => (
                    $query->where('attribute_id', $attribute->id)
                ))
                ->get();

            foreach ($materials as $material) {
                $material->attributes()->detach([$attribute->id]);
                debug("-> Caractéristique supprimée pour le matériel \"%s\".", $material->name);
            }
        }
    }
}
