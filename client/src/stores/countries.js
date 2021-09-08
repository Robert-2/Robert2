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
        fetch({ state, commit }) {
            if (state.isFetched) {
                return;
            }

            requester.get('countries')
                .then(({ data }) => {
                    commit('init', data.data);
                })
                .catch((error) => {
                    commit('setError', error);
                });
        },
    },
};
