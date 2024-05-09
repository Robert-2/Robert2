import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import stores from '@/themes/default/stores';

Vue.use(Vuex);

type State = {
    pageRawTitle: string | null,
};

export default new Store({
    state: {
        pageRawTitle: null,
    },
    mutations: {
        setPageRawTitle(state: State, title: string | null) {
            state.pageRawTitle = title;
        },
    },
    modules: stores,
});
