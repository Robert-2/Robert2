import Decimal from 'decimal.js';
import config from '@/globals/config';

import type Currency from '@/utils/currency';

const formatAmount = (rawAmount: number | Decimal = 0, currency?: Currency): string => {
    let amount = rawAmount;
    if (rawAmount instanceof Decimal) {
        amount = rawAmount.toNumber();
    }

    return amount.toLocaleString(undefined, {
        style: 'currency',
        currency: (currency ?? config.currency).code,
        currencyDisplay: 'symbol',
        useGrouping: true,
    });
};

export default formatAmount;
