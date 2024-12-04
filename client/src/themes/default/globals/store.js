import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import stores from '@/themes/default/stores';

Vue.use(Vuex);

export default new Store({
    state: {
        pageRawTitle: null,
    },
    mutations: {
        setPageRawTitle(state, title) {
            state.pageRawTitle = title;
        },
    },
    modules: stores,
});
