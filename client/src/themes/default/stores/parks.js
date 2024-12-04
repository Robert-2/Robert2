import createEntityStore from '@/utils/createEntityStore';
import apiParks from '@/stores/api/parks';

export default createEntityStore(
    () => apiParks.list(),
    {
        getName: (state) => (parkId) => {
            const park = state.list.find((_park) => _park.id === parkId);
            return park ? park.name : null;
        },

        firstPark: (state) => {
            const [park] = state.list;
            return park;
        },
    },
);
