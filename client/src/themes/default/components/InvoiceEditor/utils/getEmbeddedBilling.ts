import Decimal from 'decimal.js';

import type {
    Booking,
    BookingExtra,
    BookingMaterial,
    BillingData,
    ExtraBillingData,
    MaterialBillingData,
} from '@/stores/api/bookings';

export const getEmbeddedMaterialBilling = (material: BookingMaterial<true>): MaterialBillingData => ({
    id: material.id,
    unit_price: material.unit_price,
    discount_rate: material.discount_rate,
});

export const getEmbeddedExtraBilling = (extra: BookingExtra): ExtraBillingData => ({
    id: extra.id,
    description: extra.description,
    quantity: extra.quantity,
    unit_price: extra.unit_price,
    tax_id: extra.tax_id,
    taxes: extra.taxes,
});

const getEmbeddedBilling = (booking: Booking<true>): BillingData => {
    // - Global data.
    const globalDiscountRate = booking.global_discount_rate ?? new Decimal(0);

    // - Materials
    const materials: MaterialBillingData[] = booking.materials.map(
        (material: BookingMaterial<true>): MaterialBillingData => (
            getEmbeddedMaterialBilling(material)
        ),
    );

    // - Extras
    const extras: ExtraBillingData[] = (booking.extras ?? []).map(
        (extra: BookingExtra): ExtraBillingData => (
            getEmbeddedExtraBilling(extra)
        ),
    );

    return {
        global_discount_rate: globalDiscountRate,
        materials,
        extras,
    };
};

export default getEmbeddedBilling;
