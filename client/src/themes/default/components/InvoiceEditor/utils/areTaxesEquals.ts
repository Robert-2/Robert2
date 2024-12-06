import Decimal from 'decimal.js';
import sortTaxes from './sortTaxes';

import type { PriceDetails, Tax } from '../_types';
import type Currency from '@/utils/currency';

const comparator = (a: Tax, b: Tax, currency: Currency): boolean => {
    if (a.name !== b.name || a.is_rate !== b.is_rate) {
        return false;
    }

    if (a.is_rate && b.is_rate) {
        return a.value.equals(b.value);
    }

    const aValue: PriceDetails = a.value instanceof Decimal
        ? { amount: a.value, currency }
        : a.value;

    const bValue: PriceDetails = b.value instanceof Decimal
        ? { amount: b.value, currency }
        : b.value;

    return (
        aValue.currency.isSame(bValue.currency) &&
        aValue.amount.equals(bValue.amount)
    );
};

const areTaxesEqualsFactory = (bookingCurrency: Currency) => (
    (a: Tax[], b: Tax[]): boolean => {
        if (a.length !== b.length) {
            return false;
        }

        const aSorted = sortTaxes(a);
        const bSorted = sortTaxes(b);

        return aSorted.every((_a: Tax, index: number) => {
            const _b = bSorted[index];
            return comparator(_a, _b, bookingCurrency);
        });
    }
);

export default areTaxesEqualsFactory;
