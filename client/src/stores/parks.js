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
        options: (state, getters, rootState) => {
            const { locale, translations } = rootState.i18n;
            return formatOptions(state.list, null, translations[locale]['please-choose']);
        },

        parkName: (state) => (parkId) => {
            const park = state.list.find((_park) => _park.id === parkId);
            return park ? park.name : null;
        },

        firstPark: (state) => {
            const [park] = state.list;
            return park;
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
        async fetch({ state, commit }, shouldThrow = false) {
            if (state.isFetched) {
                return state.list;
            }

            let data;
            try {
                data = (await requester.get('parks/list')).data;
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

        refresh({ state, commit }) {
            state.isFetched = false;

            requester.get('parks/list')
                .then(({ data }) => {
                    commit('init', data);
                })
                .catch((error) => {
                    commit('setError', error);
                });
        },
    },
};
