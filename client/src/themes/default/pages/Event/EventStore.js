import Vuex from 'vuex';
import Decimal from 'decimal.js';
import isSameDate from '@/utils/isSameDate';

export default new Vuex.Store({
    state: {
        title: '',
        dates: { start: null, end: null },
        duration: { days: null },
        location: null,
        description: null,
        materials: [],
        totalWithoutTaxes: new Decimal(0),
        degressiveRate: new Decimal(1),
        isConfirmed: false,
        isBillable: true,
        isSaved: false,
    },
    mutations: {
        reset(state) {
            state.title = '';
            state.dates = { start: null, end: null };
            state.duration = { days: null };
            state.location = null;
            state.description = null;
            state.materials = [];
            state.totalWithoutTaxes = new Decimal(0);
            state.degressiveRate = new Decimal(1);
            state.isConfirmed = false;
            state.isBillable = true;
            state.isSaved = true;
        },

        init(state, event) {
            state.title = event.title;
            state.dates = { start: event.start_date, end: event.end_date };
            state.duration = event.duration;
            state.location = event.location;
            state.description = event.description;
            state.isBillable = event.is_billable;
            state.materials = event.materials;
            state.totalWithoutTaxes = event.total_without_taxes ?? new Decimal(0);
            state.degressiveRate = event.degressive_rate ?? new Decimal(1);
            state.isConfirmed = event.is_confirmed;
        },

        setIsSaved(state, isSaved) {
            state.isSaved = isSaved;
        },
    },
    actions: {
        checkIsSaved({ commit, state }, event) {
            const isIdentical = (
                event.title === (state.title || '') &&
                isSameDate(event.start_date, state.dates.start) &&
                isSameDate(event.end_date, state.dates.end) &&
                event.location === (state.location || '') &&
                event.description === (state.description || '') &&
                event.is_confirmed === state.isConfirmed &&
                event.is_billable === state.isBillable
            );

            commit('setIsSaved', isIdentical);
        },
    },
});
