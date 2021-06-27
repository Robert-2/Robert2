/* eslint-disable import/prefer-default-export */

export const normalizeUnitsQuantities = (material, units = []) => {
  const {
    is_unitary: isUnitary,
    awaited_units: awaitedUnits = [],
  } = material;

  if (!isUnitary) {
    return [];
  }

  const normalizedUnits = awaitedUnits.map(({ id }) => {
    const existingUnit = units.find((unit) => unit.id === id);
    if (!existingUnit) {
      return { id, isLost: true, isBroken: false };
    }

    const { isLost = true, isBroken = false } = existingUnit;
    return { id, isLost: isLost && !isBroken, isBroken };
  });

  return normalizedUnits;
};
