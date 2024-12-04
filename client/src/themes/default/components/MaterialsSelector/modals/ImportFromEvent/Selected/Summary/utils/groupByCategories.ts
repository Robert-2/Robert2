import Decimal from 'decimal.js';
import invariant from 'invariant';
import stringCompare from '@/utils/stringCompare';
import getRentalPriceData from '../../../../../utils/getRentalPriceData';

import type { Category } from '@/stores/api/categories';
import type { EventMaterial } from '@/stores/api/events';
import type { SourceMaterial } from '../../../../../_types';
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

const getEmbeddedMaterialTotalPrice = (embeddedMaterial: EmbeddedMaterial): Decimal => {
    const rentalPriceData = getRentalPriceData(embeddedMaterial);
    return rentalPriceData.sync.rentalPrice
        .times(embeddedMaterial.quantity)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
};

const groupByCategories = (
    materials: EventMaterial[],
    allMaterials: SourceMaterial[],
    allCategories: Category[],
    sortBy: SortBy = SortBy.NAME,
): EmbeddedMaterialsByCategory[] => {
    invariant(
        Object.values(SortBy).includes(sortBy),
        `The \`${sortBy}\` sort type is not supported.`,
    );

    if (materials.length === 0) {
        return [];
    }

    const sections = new Map<Category['id'] | null, EmbeddedMaterialsByCategory>();

    materials.forEach((eventMaterial: EventMaterial) => {
        const { id, quantity } = eventMaterial;

        const material = allMaterials.find(({ id: _id }: SourceMaterial) => _id === id);
        if (!material || material.is_deleted) {
            return;
        }

        const { id: categoryId = null, name: categoryName = null } = (
            material.category_id !== null
                ? (allCategories.find(({ id: _id }: Category) => _id === material.category_id) ?? {})
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
        section!.materials.push({
            ...material,
            quantity,
        });
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
