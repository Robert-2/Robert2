import apiSettings from '@/stores/api/settings';

const getDefaults = () => ({
    'eventSummary': {
        'customText': {
            'title': null,
            'content': null,
        },
        'materialDisplayMode': 'sub-categories',
        'showLegalNumbers': true,
    },
    'calendar': {
        'event': {
            'showLocation': true,
            'showBorrower': false,
        },
    },
});

export default {
    namespaced: true,
    state: getDefaults(),
    mutations: {
        reset(state) {
            Object.assign(state, getDefaults());
        },
        set(state, data) {
            Object.assign(state, data);
        },
    },
    actions: {
        reset({ commit }) {
            commit('reset');
        },
        async fetch({ commit }) {
            commit('set', await apiSettings.all());
        },
    },
};
