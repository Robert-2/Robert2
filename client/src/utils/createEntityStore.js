import formatOptions from '@/utils/formatOptions';

const createEntityStore = (fetcher, additionalGetters = {}) => {
    let ongoingFetch = null;

    return {
        namespaced: true,
        state: {
            list: [],
            isFetched: false,
        },
        getters: {
            options: (state) => formatOptions(state.list),
            ...additionalGetters,
        },
        mutations: {
            init(state, data) {
                state.list = data;
                state.isFetched = true;
            },
        },
        actions: {
            async fetch({ state, dispatch }, shouldThrow = false) {
                if (state.isFetched) {
                    return state.list;
                }

                const hadOngoingFetch = !!ongoingFetch;
                if (!hadOngoingFetch) {
                    ongoingFetch = dispatch('internalFetch', true);
                }

                let data;
                try {
                    data = await ongoingFetch;
                } catch (error) {
                    if (shouldThrow) {
                        throw error;
                    }
                    data = [];
                } finally {
                    if (!hadOngoingFetch) {
                        ongoingFetch = null;
                    }
                }

                return data;
            },

            async internalFetch({ commit }, shouldThrow = false) {
                let data;
                try {
                    data = await fetcher();
                    commit('init', data);
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.warn('Error while retrieving entity data', error);

                    if (shouldThrow) {
                        throw error;
                    }

                    data = [];
                }

                return data;
            },

            refresh({ state, dispatch }, shouldThrow = false) {
                state.isFetched = false;
                return dispatch('internalFetch', shouldThrow);
            },
        },
    };
};

export default createEntityStore;
