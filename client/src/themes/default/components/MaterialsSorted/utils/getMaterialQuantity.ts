import type { BookingMaterial } from './_types';

const getMaterialQuantity = (material: BookingMaterial): number => {
    if ('pivot' in material) {
        return material.pivot.quantity;
    }

    throw new Error(`Unable to find quantity in booking's material`);
};

export default getMaterialQuantity;
