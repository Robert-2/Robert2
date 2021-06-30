/* eslint-disable import/no-cycle */
import axios from '@/axios';

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
      return state.list.map(({ name }) => ({
        value: name,
        label: translations[locale][`unit-state.${name}`] ?? '-- trad. manquante --',
      }));
    },

    unitStateName: (state, getters, rootState) => (name) => {
      const unitState = state.list.find((_unitState) => _unitState.name === name);
      if (!unitState) {
        return null;
      }
      const { locale, translations } = rootState.i18n;
      return translations[locale][`unit-state.${name}`] ?? null;
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
        data = (await axios.get('unit-states')).data;
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

      axios.get('unit-states')
        .then(({ data }) => {
          commit('init', data);
        })
        .catch((error) => {
          commit('setError', error);
        });
    },
  },
};
