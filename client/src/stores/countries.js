/* eslint-disable import/no-cycle */
import axios from '@/axios';
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
      const emptyLabel = translations[locale]['please-choose'];
      return formatOptions(state.list, ['name'], emptyLabel);
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

      axios.get('countries')
        .then(({ data }) => {
          commit('init', data.data);
        })
        .catch((error) => {
          commit('setError', error);
        });
    },
  },
};
