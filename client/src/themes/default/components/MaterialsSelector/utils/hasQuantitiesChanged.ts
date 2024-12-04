import type { SelectedMaterial } from '../_types';

const areQuantitiesEquals = <T extends SelectedMaterial>(a: T, b: T): boolean => {
    if (a.id !== b.id || a.quantity !== b.quantity) {
        return false;
    }

    return true;
};

const areQuantitiesArraysEquals = <T extends SelectedMaterial>(
    a: T[],
    b: T[],
    comparator: (aItem: T, bItem: T) => boolean = areQuantitiesEquals,
): boolean => {
    // - Si un nouveau matériel n'est pas identique à un matériel déjà sauvé.
    const differencesA = a.filter((aList: T) => {
        if (aList.quantity === 0) {
            return false;
        }
        return !b.some((bList: T) => comparator(aList, bList));
    });
    if (differencesA.length > 0) {
        return false;
    }

    // - Si un matériel sauvé n'existe plus ou a changé dans le nouveau jeu de données.
    const differencesB = b.filter((bList: T) => {
        if (bList.quantity === 0) {
            return false;
        }
        return !a.some((aList: T) => comparator(bList, aList));
    });

    return differencesB.length === 0;
};

const hasQuantitiesChanged = (before: SelectedMaterial[], after: SelectedMaterial[]): boolean => (
    !areQuantitiesArraysEquals(before, after, (a: SelectedMaterial, b: SelectedMaterial): boolean => (
        areQuantitiesEquals(a, b)
    ))
);

export default hasQuantitiesChanged;
