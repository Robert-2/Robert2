/* eslint-disable import/no-cycle */
import requester from '@/globals/requester';
import formatOptions from '@/utils/formatOptions';

export default {
    namespaced: true,
    state: {
        list: [],
        isFetched: false,
        error: null,
    },
    getters: {
        options: (state) => formatOptions(state.list),

        unitStateName: (state) => (id) => {
            const unitState = state.list.find((_unitState) => _unitState.id === id);
            return unitState ? unitState.name : null;
        },
    },
    mutations: {
        init(state, data) {
            state.list = data;
            state.isFetched = true;
            state.error = null;
        },

        setError(state, errorData) {
            state.error = errorData;
        },

        reset(state) {
            state.list = [];
            state.isFetched = false;
            state.error = null;
        },
    },
    actions: {
        async fetch({ state, dispatch }, shouldThrow = false) {
            if (state.isFetched) {
                return state.list;
            }

            const hadOngoingFetch = !!this.ongoingFetch;
            if (!hadOngoingFetch) {
                this.ongoingFetch = dispatch('internalFetch', true);
            }

            let data;
            try {
                data = await this.ongoingFetch;
            } catch (error) {
                if (shouldThrow) {
                    throw error;
                }
                data = [];
            } finally {
                if (!hadOngoingFetch) {
                    this.ongoingFetch = null;
                }
            }

            return data;
        },

        async internalFetch({ commit }, shouldThrow = false) {
            let data;
            try {
                data = (await requester.get('unit-states')).data;
                commit('init', data);
            } catch (error) {
                commit('setError', error);

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
