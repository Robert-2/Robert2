import Decimal from 'decimal.js';

import type { BookingMaterial } from './_types';

const getMaterialUnitPrice = (material: BookingMaterial): Decimal => {
    if ('rental_price' in material) {
        return material.rental_price ?? new Decimal(0);
    }

    throw new Error(`Unable to find price in booking's material`);
};

export default getMaterialUnitPrice;
