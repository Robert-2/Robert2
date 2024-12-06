import Decimal from 'decimal.js';
import invariant from 'invariant';
import stringCompare from '@/utils/stringCompare';

import type { Category } from '@/stores/api/categories';
import type { EmbeddedMaterial } from '../_types';

export enum SortBy {
    /** Le matériel sera trié via son nom. */
    NAME = 'name',

    /**
     * Le matériel sera trié via son prix.
     *
     * Ceci suppose que le prix des matériels embarqués est fourni,
     * sans quoi le prix sera considéré comme étant à 0.
     */
    PRICE = 'price',
}

export type EmbeddedMaterialsByCategory = {
    id: Category['id'] | null,
    name: Category['name'] | null,
    materials: EmbeddedMaterial[],
};

const getEmbeddedMaterialTotalPrice = (embeddedMaterial: EmbeddedMaterial): Decimal => (
    'total_without_taxes' in embeddedMaterial
        ? embeddedMaterial.total_without_taxes
        : new Decimal(0)
);

/**
 * Permet de grouper et trier du matériel embarqué par catégories.
 *
 * @param embeddedMaterials - Le matériel à trier.
 * @param categories - Les catégories dans lesquelles répartir le matériel.
 * @param sortBy - La colonne sur laquelle le tri est opéré à l'intérieur des catégories.
 *
 * @returns La liste du matériel, triée et groupée par catégories.
 */
const groupByCategories = (
    embeddedMaterials: EmbeddedMaterial[],
    categories: Category[],
    sortBy: SortBy = SortBy.NAME,
): EmbeddedMaterialsByCategory[] => {
    invariant(
        Object.values(SortBy).includes(sortBy),
        `The \`${sortBy}\` sort type is not supported.`,
    );

    if (embeddedMaterials.length === 0) {
        return [];
    }

    const sections = new Map<Category['id'] | null, EmbeddedMaterialsByCategory>();

    embeddedMaterials.forEach((embeddedMaterial: EmbeddedMaterial) => {
        const { id: categoryId = null, name: categoryName = null } = (
            embeddedMaterial.category_id !== null
                ? (categories.find(({ id }: Category) => id === embeddedMaterial.category_id) ?? {})
                : {}
        );

        if (!sections.has(categoryId)) {
            sections.set(categoryId, {
                id: categoryId,
                name: categoryName,
                materials: [],
            });
        }

        const section = sections.get(categoryId);
        section!.materials.push(embeddedMaterial);
    });

    const result = Array.from(sections.values());

    // - Tri.
    result.sort((a: EmbeddedMaterialsByCategory, b: EmbeddedMaterialsByCategory) => (
        stringCompare(a.name ?? '', b.name ?? '')
    ));
    result.forEach((section: EmbeddedMaterialsByCategory) => {
        section.materials.sort((a: EmbeddedMaterial, b: EmbeddedMaterial) => {
            if (sortBy === SortBy.PRICE) {
                return getEmbeddedMaterialTotalPrice(a)
                    .greaterThan(getEmbeddedMaterialTotalPrice(b)) ? -1 : 1;
            }
            return stringCompare(a.name, b.name);
        });
    });

    return result;
};

export default groupByCategories;
