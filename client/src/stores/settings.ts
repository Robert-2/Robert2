import apiSettings, { MaterialDisplayMode, ReturnInventoryMode } from '@/stores/api/settings';

import type { Module, ActionContext } from 'vuex';
import type { Settings } from '@/stores/api/settings';

export type State = Settings;

const getDefaults = (): Settings => ({
    eventSummary: {
        customText: {
            title: null,
            content: null,
        },
        materialDisplayMode: MaterialDisplayMode.SUB_CATEGORIES,
        showLegalNumbers: true,
    },
    calendar: {
        event: {
            showLocation: true,
            showBorrower: false,
        },
        public: {
            enabled: false,
        },
    },
    returnInventory: {
        mode: ReturnInventoryMode.START_EMPTY,
    },
});

const store: Module<State, any> = {
    namespaced: true,
    state: getDefaults(),
    mutations: {
        reset(state: State) {
            Object.assign(state, getDefaults());
        },
        set(state: State, data: State) {
            Object.assign(state, data);
        },
    },
    actions: {
        reset({ commit }: ActionContext<State, any>) {
            commit('reset');
        },
        async fetch({ commit }: ActionContext<State, any>) {
            commit('set', await apiSettings.all());
        },
    },
};

export default store;
