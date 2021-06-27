/* eslint-disable import/no-cycle */

import Vue from 'vue';
import Vuex from 'vuex';
import countriesStore from '@/stores/countries';
import parksStore from '@/stores/parks';
import unitStatesStore from '@/stores/unit-states';
import categoriesStore from '@/stores/categories';
import companiesStore from '@/stores/companies';
import tagsStore from '@/stores/tags';
import authStore from '@/stores/auth';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    pageRawTitle: null,
    pageTitle: '',
    pageSubTitle: '',
  },
  mutations: {
    setPageRawTitle(state, title) {
      state.pageRawTitle = title;
    },
    setPageTitle(state, pageTitle) {
      state.pageTitle = pageTitle;
      state.pageSubTitle = '';
    },
    setPageSubTitle(state, pageSubTitle) {
      state.pageSubTitle = pageSubTitle;
    },
  },
  modules: {
    countries: countriesStore,
    parks: parksStore,
    unitStates: unitStatesStore,
    categories: categoriesStore,
    companies: companiesStore,
    tags: tagsStore,
    auth: authStore,
  },
});
