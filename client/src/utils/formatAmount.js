import Config from '@/globals/config';

const formatAmount = (amount = 0) => {
    const { iso } = Config.currency;

    return amount.toLocaleString(undefined, {
        style: 'currency',
        currency: iso,
        currencyDisplay: 'symbol',
        useGrouping: true,
    });
};

export default formatAmount;
