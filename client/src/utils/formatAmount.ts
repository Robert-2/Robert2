import Decimal from 'decimal.js';
import config from '@/globals/config';

const formatAmount = (rawAmount: number | Decimal = 0, currency?: string): string => {
    let amount = rawAmount;
    if (rawAmount instanceof Decimal) {
        amount = rawAmount.toNumber();
    }

    return amount.toLocaleString(undefined, {
        style: 'currency',
        currency: currency ?? config.currency.iso,
        currencyDisplay: 'symbol',
        useGrouping: true,
    });
};

export default formatAmount;
