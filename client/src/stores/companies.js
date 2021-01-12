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
      return formatOptions(
        state.list,
        (item) => item.legal_name,
        translations[locale]['please-choose'],
      );
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

      axios.get('companies')
        .then(({ data }) => {
          commit('init', data.data);
        })
        .catch((error) => {
          commit('setError', error);
        });
    },

    refresh({ state, commit }) {
      state.isFetched = false;

      axios.get('companies')
        .then(({ data }) => {
          commit('init', data.data);
        })
        .catch((error) => {
          commit('setError', error);
        });
    },
  },
};
