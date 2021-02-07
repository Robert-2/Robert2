const materialComparatorBuilder = (a) => (b) => {
  if (a.id !== b.id) {
    return false;
  }

  const unitsDiff = a.units
    .filter((unit) => !b.units.includes(unit))
    .concat(b.units.filter((unit) => !a.units.includes(unit)));

  if (unitsDiff.length > 0) {
    return false;
  }

  return a.quantity === b.quantity;
};

export const getMaterialsQuantities = (materials) => (
  materials.map(({ id, is_unitary: isUnitary, pivot }) => {
    const data = { id, quantity: pivot.quantity, units: [] };
    return !isUnitary ? data : { ...data, units: pivot.units };
  })
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
  const differencesOld = before.filter(
    (oldMaterial) => !after.some(materialComparatorBuilder(oldMaterial)),
  );
  // eslint-disable-next-line no-unused-expressions
  return differencesOld.length > 0;
};
