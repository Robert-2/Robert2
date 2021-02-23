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
      return formatOptions(state.list, null, translations[locale]['please-choose']);
    },

    parkName: (state) => (parkId) => {
      const park = state.list.find(
        (_park) => _park.id === parkId,
      );
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
  },
  actions: {
    fetch({ state, commit }) {
      if (state.isFetched) {
        return;
      }

      axios.get('parks')
        .then(({ data }) => {
          commit('init', data.data);
        })
        .catch((error) => {
          commit('setError', error);
        });
    },

    refresh({ state, commit }) {
      state.isFetched = false;

      axios.get('parks')
        .then(({ data }) => {
          commit('init', data.data);
        })
        .catch((error) => {
          commit('setError', error);
        });
    },
  },
};
