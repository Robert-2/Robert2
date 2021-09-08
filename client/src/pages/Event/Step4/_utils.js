const materialComparatorBuilder = (a) => (b) => {
    if (a.id !== b.id) {
        return false;
    }

    return a.quantity === b.quantity;
};

export const getMaterialsQuantities = (materials) => (
    materials.map(({ id, pivot }) => (
        { id, quantity: pivot?.quantity || 0 }
    ))
);

export const materialsHasChanged = (before, after) => {
    // - Si un nouveau matériel n'est pas identique à un matériel déjà sauvé.
    const differencesNew = after.filter((newMaterial) => {
        if (newMaterial.quantity === 0) {
            return false;
        }
        return !before.some(materialComparatorBuilder(newMaterial));
    });
    if (differencesNew.length > 0) {
        return true;
    }

    // - Si un matériel sauvé n'existe plus ou a changé dans le nouveau jeu de données.
    const differencesOld = before.filter((oldMaterial) => {
        if (oldMaterial.quantity === 0) {
            return false;
        }
        return !after.some(materialComparatorBuilder(oldMaterial));
    });

    return differencesOld.length > 0;
};
