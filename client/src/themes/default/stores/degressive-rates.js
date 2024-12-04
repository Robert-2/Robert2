import createEntityStore from '@/utils/createEntityStore';
import apiDegressiveRates from '@/stores/api/degressive-rates';

export default createEntityStore(
    () => apiDegressiveRates.all(),
    {
        getName: (state) => (degressiveRateId) => {
            const degressiveRate = state.list.find(
                (_degressiveRate) => _degressiveRate.id === degressiveRateId,
            );
            return degressiveRate ? degressiveRate.name : null;
        },
    },
);
