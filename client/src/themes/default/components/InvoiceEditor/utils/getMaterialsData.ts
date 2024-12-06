import pick from 'lodash/pick';
import Decimal from 'decimal.js';
import config from '@/globals/config';
import areTaxesEqualsFactory from './areTaxesEquals';

import type { Tax as CoreTax } from '@/stores/api/taxes';
import type {
    Booking,
    BookingTax,
    BookingMaterial,
} from '@/stores/api/bookings';
import type {
    Tax,
    Taxes,
    PriceDetails,
    BillingMaterial,
    UnsyncedDataValue,
    RawMaterialBillingData,
} from '../_types';

const getMaterialsDataFactory = (allTaxes: CoreTax[]) => (
    (booking: Booking<true>, pendingData: RawMaterialBillingData[]): BillingMaterial[] => {
        const baseCurrency = config.currency;
        const hasUnsyncedCurrency = !booking.currency.isSame(baseCurrency);
        const areTaxesEquals = areTaxesEqualsFactory(booking.currency);

        return booking.materials.map(
            (bookingMaterial: BookingMaterial<true>): BillingMaterial => {
                const { material } = bookingMaterial;

                const data = pendingData.find(
                    (_datum: RawMaterialBillingData) => (
                        _datum.id === material.id
                    ),
                );

                const name: UnsyncedDataValue<string> = (() => {
                    const base = material.name;
                    const current = bookingMaterial.name;
                    const isUnsynced = !material.is_deleted && base !== current;

                    return {
                        base,
                        current,
                        isUnsynced,
                        isResyncable: isUnsynced,
                    };
                })();

                const reference: UnsyncedDataValue<string> = (() => {
                    const base = material.reference;
                    const current = bookingMaterial.reference;
                    const isUnsynced = !material.is_deleted && base !== current;

                    return {
                        base,
                        current,
                        isUnsynced,
                        isResyncable: isUnsynced,
                    };
                })();

                const unitPrice: UnsyncedDataValue<PriceDetails, Decimal> = (() => {
                    const basePrice = material.rental_price ?? new Decimal(0);
                    const currentPrice = data?.unit_price ?? null;

                    const isUnsynced = material.is_deleted || currentPrice === null ? false : (
                        hasUnsyncedCurrency || !currentPrice.equals(basePrice)
                    );

                    const isResyncable = isUnsynced && !hasUnsyncedCurrency;

                    const base: PriceDetails = { amount: basePrice, currency: baseCurrency };
                    const current: Decimal = (() => {
                        if (currentPrice !== null) {
                            return currentPrice;
                        }
                        return !hasUnsyncedCurrency ? base.amount : new Decimal(0);
                    })();

                    return {
                        base,
                        current,
                        isUnsynced,
                        isResyncable,
                    };
                })();

                const degressiveRate: UnsyncedDataValue<Decimal> = (() => {
                    const base = material.degressive_rate ?? new Decimal(booking.operation_period.asDays());
                    const current = bookingMaterial.degressive_rate;
                    const isUnsynced = !material.is_deleted && !current.equals(base);

                    return {
                        base,
                        current,
                        isUnsynced,
                        isResyncable: isUnsynced,
                    };
                })();

                const unitPricePeriod = unitPrice.current
                    .times(degressiveRate.current)
                    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

                // eslint-disable-next-line @typescript-eslint/prefer-destructuring
                const quantity = bookingMaterial.quantity;

                const totalWithoutDiscount = unitPricePeriod
                    .times(bookingMaterial.quantity)
                    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

                const discountRate: Decimal = data !== undefined
                    ? data.discount_rate
                    : new Decimal(0);

                const totalDiscount = totalWithoutDiscount
                    .times(discountRate.dividedBy(100).toDecimalPlaces(5))
                    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

                const totalWithoutTaxes = totalWithoutDiscount
                    .minus(totalDiscount)
                    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

                const taxes: UnsyncedDataValue<Taxes<PriceDetails>, Taxes<Decimal>> = (() => {
                    const base: Taxes<PriceDetails> = (() => {
                        const baseTax: CoreTax | undefined = ![null, undefined].includes(material.tax_id as any)
                            ? allTaxes.find(({ id: _id }: CoreTax) => _id === material.tax_id!)
                            : undefined;

                        if (baseTax === undefined) {
                            return [];
                        }

                        const rawTaxes: Taxes<Decimal> = !baseTax.is_group
                            ? [pick(baseTax, ['name', 'is_rate', 'value'])]
                            : baseTax.components;

                        return rawTaxes.map((tax: BookingTax): Tax<PriceDetails> => {
                            if (tax.is_rate) {
                                return tax as Tax<PriceDetails, true>;
                            }

                            const price: PriceDetails = { amount: tax.value, currency: baseCurrency };
                            return { ...tax, value: price } as Tax<PriceDetails, false>;
                        });
                    })();
                    const current: Taxes<Decimal> = bookingMaterial.taxes;

                    const isUnsynced = !material.is_deleted && !areTaxesEquals(base, current);
                    const isResyncable = isUnsynced && (
                        !hasUnsyncedCurrency ||
                        !base.some((tax: Tax) => !tax.is_rate)
                    );

                    return {
                        base,
                        current,
                        isUnsynced,
                        isResyncable,
                    };
                })();

                const isDiscountable = material.is_discountable ?? true;

                const isUnsynced = (
                    name.isUnsynced ||
                    reference.isUnsynced ||
                    unitPrice.isUnsynced ||
                    degressiveRate.isUnsynced ||
                    taxes.isUnsynced
                );

                const isResyncable = (
                    name.isResyncable ||
                    reference.isResyncable ||
                    unitPrice.isResyncable ||
                    degressiveRate.isResyncable ||
                    taxes.isResyncable
                );

                return {
                    id: material.id,
                    name,
                    reference,
                    quantity,
                    is_discountable: isDiscountable,
                    is_unsynced: isUnsynced,
                    is_resyncable: isResyncable,
                    unit_price: unitPrice,
                    degressive_rate: degressiveRate,
                    unit_price_period: unitPricePeriod,
                    total_without_discount: totalWithoutDiscount,
                    discount_rate: discountRate,
                    total_discount: totalDiscount,
                    total_without_taxes: totalWithoutTaxes,
                    taxes,
                };
            },
        );
    }
);

export default getMaterialsDataFactory;
