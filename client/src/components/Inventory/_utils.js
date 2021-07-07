/* eslint-disable import/prefer-default-export */

export const normalizeUnitsQuantities = (material, units = []) => {
  const {
    is_unitary: isUnitary,
    awaited_units: awaitedUnits = [],
  } = material;

  if (!isUnitary) {
    return [];
  }

  const normalizedUnits = awaitedUnits.map(({ id, state: originalState }) => {
    const existingUnit = units.find((unit) => unit.id === id);
    if (!existingUnit) {
      return {
        id,
        state: originalState,
        isLost: true,
        isBroken: false,
      };
    }

    const isBroken = existingUnit.isBroken ?? false;
    const isLost = isBroken ? false : (existingUnit.isLost ?? true);
    const state = isLost ? originalState : (existingUnit.state ?? originalState);

    return { id, state, isLost, isBroken };
  });

  return normalizedUnits;
};
