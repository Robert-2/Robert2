<?php
declare(strict_types=1);

namespace Loxya\Observers;

use Loxya\Models\Attribute;
use Loxya\Models\AttributeCategory;
use Loxya\Models\Material;

final class AttributeCategoryObserver
{
    public $afterCommit = true;

    public function created(AttributeCategory $attributeCategory)
    {
        $attribute = Attribute::find($attributeCategory->attribute_id);
        $attributeCategoriesIds = $attribute->categories->pluck('id')->all();

        debug(
            "[Event] La caractéristique #%d est maintenant limitée aux catégories [%s].",
            $attribute->id,
            implode(', ', $attributeCategoriesIds)
        );

        //
        // - Suppression de la caractéristique pour le matériel ne faisant pas partie
        //   des nouvelles catégories limitantes.
        //

        $categoryMaterials = Material::whereNotIn('category_id', $attributeCategoriesIds)
            ->whereHas('attributes', function ($query) use ($attribute) {
                $query->where('attribute_id', $attribute->id);
            })
            ->get();

        foreach ($categoryMaterials as $material) {
            $material->attributes()->detach([$attribute->id]);
            debug(
                "-> Caractéristique supprimée pour le matériel \"%s\" (catégorie \"%s\").",
                $material->name,
                $material->category->name
            );
        }
    }

    public function deleted(AttributeCategory $attributeCategory)
    {
        $categoryId = $attributeCategory->category_id;
        $attributeId = $attributeCategory->attribute_id;

        debug("[Event] La caractéristique #%d n'est plus limitée à la catégorie #%d.", $attributeId, $categoryId);

        //
        // - Suppression de la caractéristique pour le matériel faisant partie
        //   de la catégorie qui ne limite plus cette caractéristique.
        //

        $categoryMaterials = Material::where('category_id', $categoryId)
            ->whereHas('attributes', function ($query) use ($attributeId) {
                $query->where('attribute_id', $attributeId);
            })
            ->get();

        foreach ($categoryMaterials as $material) {
            $material->attributes()->detach([$attributeId]);
            debug("-> Caractéristique supprimée pour le matériel \"%s\".", $material->name);
        }
    }
}
