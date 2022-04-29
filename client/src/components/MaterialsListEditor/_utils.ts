import isValidInteger from '@/utils/isValidInteger';

import type { Material } from '@/stores/api/materials';

//
// - Types
//

export type MaterialQuantity = {
    id: number,
    quantity: number,
};

export type RawFilters = Record<string, number | string | string[] | boolean>;

export type MaterialsFiltersType = {
    onlySelected?: boolean,
    park?: number | null,
    category?: number | null,
    subCategory?: number | null,
    tags?: string[],
};

export type MaterialWithPivot = Material & {
    pivot: {
        id: number,
        quantity: number,
    },
};

//
// - Filters
//

export const normalizeFilters = (rawFilters: RawFilters, extended: boolean = true): MaterialsFiltersType => {
    const filters: MaterialsFiltersType = extended
        ? { park: null, category: null, subCategory: null, tags: [] }
        : {};

    if ('onlySelected' in rawFilters) {
        filters.onlySelected = !!rawFilters.onlySelected;
    }

    if ('tags' in rawFilters && Array.isArray(rawFilters.tags)) {
        filters.tags = rawFilters.tags!;
    }

    ['park', 'category', 'subCategory'].forEach((key: string) => {
        if (key in rawFilters && isValidInteger(rawFilters[key])) {
            // @ts-ignore - Ici, on sait que `key` est un nombre.
            filters[key] = parseInt(rawFilters[key] as string, 10);
        }
    });

    return filters;
};

//
// - Quantities
//

export const getMaterialsQuantities = (materials: MaterialWithPivot[]): MaterialQuantity[] => (
    materials.map(({ id, pivot }: MaterialWithPivot) => {
        const data = { id, quantity: pivot?.quantity || 0 };
        return data;
    })
);

const materialComparatorBuilder = (a: MaterialQuantity) => (b: MaterialQuantity) => {
    if (a.id !== b.id) {
        return false;
    }

    return a.quantity === b.quantity;
};

export const materialsHasChanged = (before: MaterialQuantity[], after: MaterialQuantity[]): boolean => {
    // - Si un nouveau matériel n'est pas identique à un matériel déjà sauvé.
    const differencesNew = after.filter((newMaterial: MaterialQuantity) => {
        if (newMaterial.quantity === 0) {
            return false;
        }
        return !before.some(materialComparatorBuilder(newMaterial));
    });
    if (differencesNew.length > 0) {
        return true;
    }

    // - Si un matériel sauvé n'existe plus ou a changé dans le nouveau jeu de données.
    const differencesOld = before.filter((oldMaterial: MaterialQuantity) => {
        if (oldMaterial.quantity === 0) {
            return false;
        }
        return !after.some(materialComparatorBuilder(oldMaterial));
    });

    return differencesOld.length > 0;
};
