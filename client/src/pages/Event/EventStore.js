import Vuex from 'vuex';
import isSameDate from '@/utils/isSameDate';

export default new Vuex.Store({
    state: {
        title: '',
        dates: { start: null, end: null },
        location: null,
        description: null,
        materials: [],
        isConfirmed: false,
        isBillable: true,
        isSaved: false,
    },
    mutations: {
        reset(state) {
            state.title = '';
            state.dates = { start: null, end: null };
            state.location = null;
            state.description = null;
            state.materials = [];
            state.isConfirmed = false;
            state.isBillable = true;
            state.isSaved = true;
        },

        init(state, event) {
            state.title = event.title;
            state.dates = { start: event.start_date, end: event.end_date };
            state.location = event.location;
            state.description = event.description;
            state.isBillable = event.is_billable;
            state.materials = event.materials;
            state.isConfirmed = event.is_confirmed;
        },

        setIsSaved(state, isSaved) {
            state.isSaved = isSaved;
        },
    },
    actions: {
        checkIsSaved({ commit, state }, event) {
            const isIdentical = (
                event.title === state.title &&
                isSameDate(event.start_date, state.dates.start) &&
                isSameDate(event.end_date, state.dates.end) &&
                event.location === state.location &&
                event.description === state.description &&
                event.is_confirmed === state.isConfirmed &&
                event.is_billable === state.isBillable
            );

            commit('setIsSaved', isIdentical);
        },
    },
});
