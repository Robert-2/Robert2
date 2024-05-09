import invariant from 'invariant';
import stringCompare from '@/utils/stringCompare';
import getMaterialQuantity from './getMaterialQuantity';
import getMaterialUnitPrice from './getMaterialUnitPrice';

import type { BookingMaterial } from './_types';
import type { Category } from '@/stores/api/categories';

export enum SortBy {
    /** Le matériel sera trié via son nom. */
    NAME = 'name',

    /**
     * Le matériel sera trié via son prix.
     * (Ceci suppose que la facturation est activée)
     */
    PRICE = 'price',
}

export type MaterialsSection = {
    id: Category['id'] | null,
    name: Category['name'] | null,
    materials: BookingMaterial[],
};

/**
 * Permet de grouper et trier du matériel de booking par catégories.
 *
 * @param materials - Le matériel de booking à trier.
 * @param categories - Les catégories dans lesquelles répartir le matériel.
 * @param sortBy - La colonne sur laquelle le tri est opéré à l'intérieur des catégories.
 *
 * @returns La liste du matériel, triée et groupée par catégories.
 */
const groupByCategories = (
    materials: BookingMaterial[],
    categories: Category[],
    sortBy: SortBy = SortBy.NAME,
): MaterialsSection[] => {
    if (materials.length === 0) {
        return [];
    }

    const sections = new Map<Category['id'] | null, MaterialsSection>();

    materials.forEach((material: BookingMaterial) => {
        const { id: categoryId = null, name: categoryName = null } = (
            material.category_id !== null
                ? (categories.find(({ id }: Category) => id === material.category_id) ?? {})
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
        section!.materials.push(material);
    });

    const result = Array.from(sections.values());

    // - Tri.
    result.sort((a: MaterialsSection, b: MaterialsSection) => (
        stringCompare(a.name ?? '', b.name ?? '')
    ));
    result.forEach((section: MaterialsSection) => {
        section.materials.sort((a: BookingMaterial, b: BookingMaterial) => {
            invariant(
                Object.values(SortBy).includes(sortBy),
                `La clé de tri "${sortBy}" n'est pas prise en charge.`,
            );

            if (sortBy === SortBy.PRICE) {
                const subtotalA = getMaterialUnitPrice(a).times(getMaterialQuantity(a));
                const subtotalB = getMaterialUnitPrice(b).times(getMaterialQuantity(b));
                return subtotalA.greaterThan(subtotalB) ? -1 : 1;
            }

            return stringCompare(a.name, b.name);
        });
    });

    return result;
};

export default groupByCategories;
