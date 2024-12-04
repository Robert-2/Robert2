import pick from 'lodash/pick';
import Decimal from 'decimal.js';
import config from '@/globals/config';
import areTaxesEqualsFactory from './areTaxesEquals';

import type { Booking, BookingExtra, BookingTax } from '@/stores/api/bookings';
import type { Tax as CoreTax } from '@/stores/api/taxes';
import type {
    Tax,
    Taxes,
    PriceDetails,
    BillingExtra,
    UnsyncedDataValue,
    RawExtraBillingData,
} from '../_types';

const getExtrasData = (allTaxes: CoreTax[]) => (
    (booking: Booking<true>, pendingData: RawExtraBillingData[]): BillingExtra[] => {
        const baseCurrency = config.currency;
        const hasUnsyncedCurrency = !booking.currency.isSame(baseCurrency);
        const areTaxesEquals = areTaxesEqualsFactory(booking.currency);

        return (
            pendingData.map((data: RawExtraBillingData): BillingExtra => {
                const savedExtra: BookingExtra | undefined = data.id === null ? undefined : (
                    booking.extras.find((_extra: BookingExtra) => _extra.id === data.id)
                );

                const totalWithoutTaxes = data.unit_price === null
                    ? new Decimal(0)
                    : data.unit_price
                        .times(data.quantity)
                        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

                const taxes: UnsyncedDataValue<Taxes<PriceDetails>, Taxes<Decimal>> = (() => {
                    const liveTaxes: Taxes<Decimal> = (() => {
                        const currentTax: CoreTax | undefined = ![null, undefined].includes(data.tax_id as any)
                            ? allTaxes.find(({ id: _id }: CoreTax) => _id === data.tax_id!)
                            : undefined;

                        if (currentTax === undefined) {
                            return [];
                        }

                        return !currentTax.is_group
                            ? [pick(currentTax, ['name', 'is_rate', 'value'])]
                            : currentTax.components;
                    })();

                    const base: Taxes<PriceDetails> = liveTaxes.map(
                        (tax: BookingTax): Tax<PriceDetails> => {
                            if (tax.is_rate) {
                                return tax as Tax<PriceDetails, true>;
                            }

                            const price: PriceDetails = { amount: tax.value, currency: baseCurrency };
                            return { ...tax, value: price } as Tax<PriceDetails, false>;
                        },
                    );

                    // - Si l'extra a été persisté et que la taxe n'a pas changée, on utilise les
                    //   données persisté dans l'extra, sinon on utilise les données live.
                    const current = savedExtra !== undefined && data.tax_id === savedExtra.tax_id
                        ? (data.taxes ?? [])
                        : liveTaxes;

                    const isUnsynced = data.id !== null && !areTaxesEquals(base, current);
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

                return {
                    ...data,
                    is_unsynced: taxes.isUnsynced,
                    is_resyncable: taxes.isResyncable,
                    total_without_taxes: totalWithoutTaxes,
                    taxes,
                };
            })
        );
    }
);

export default getExtrasData;
