import type { BookingMaterial } from './_types';

const getMaterialUnitPrice = (material: BookingMaterial): number => {
    if ('rental_price' in material) {
        return material.rental_price;
    }

    throw new Error(`Unable to find price in booking's material`);
};

export default getMaterialUnitPrice;
