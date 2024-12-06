import createEntityStore from '@/utils/createEntityStore';
import formatOptions from '@/utils/formatOptions';
import formatAmount from '@/utils/formatAmount';
import apiTaxes from '@/stores/api/taxes';

export default createEntityStore(
    () => apiTaxes.all(),
    {
        options: (state) => (
            formatOptions(state.list, (tax) => {
                if (tax.is_group) {
                    return tax.name;
                }

                const value = tax.is_rate
                    ? `${tax.value.toString()}%`
                    : formatAmount(tax.value);

                return `${tax.name} (${value})`;
            })
        ),

        getName: (state) => (taxId) => {
            const tax = state.list.find((_tax) => _tax.id === taxId);
            if (!tax) {
                return null;
            }

            if (tax.is_group) {
                return tax.name;
            }

            const value = tax.is_rate
                ? `${tax.value.toString()}%`
                : formatAmount(tax.value);

            return `${tax.name} (${value})`;
        },
    },
);
