/* eslint-disable import/no-cycle */

import Vue from 'vue';
import Vuex from 'vuex';
import stores from '@/stores';

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
    modules: stores,
});
