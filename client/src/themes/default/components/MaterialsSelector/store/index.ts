import Vuex from 'vuex';
import * as mutations from './mutations';
import * as getters from './getters';

import type { State } from './_types';

export type { State };

export default new Vuex.Store<State>({
    state: {
        materials: {},
    },
    mutations,
    getters,
});
