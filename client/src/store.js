/* eslint-disable import/no-cycle */
import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import countriesStore from '@/stores/countries';
import parksStore from '@/stores/parks';
import categoriesStore from '@/stores/categories';
import companiesStore from '@/stores/companies';
import tagsStore from '@/stores/tags';
import userStore from '@/stores/user';

Vue.use(Vuex);

export default new Vuex.Store({
  namepaced: true,
  state: {
    pageTitle: '',
    pageSubTitle: '',
  },
  mutations: {
    setPageTitle(state, pageTitle) {
      state.pageTitle = pageTitle;
    },
    setPageSubTitle(state, pageSubTitle) {
      state.pageSubTitle = pageSubTitle;
    },
  },
  modules: {
    countries: countriesStore,
    parks: parksStore,
    categories: categoriesStore,
    companies: companiesStore,
    tags: tagsStore,
    user: userStore,
  },
  plugins: [
    createPersistedState({
      strict: process.env.NODE_ENV !== 'production',
      storage: window.sessionStorage,
      key: 'persistantData',
      paths: ['user'],
    }),
  ],
});
