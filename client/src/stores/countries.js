import apiCountries from './api/countries';
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
    },
    actions: {
        async fetch({ state, commit }) {
            if (state.isFetched) {
                return;
            }

            try {
                const countries = await apiCountries.all();
                commit('init', countries);
            } catch (error) {
                commit('setError', error);
            }
        },
    },
};
