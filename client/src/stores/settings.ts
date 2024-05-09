import Day from '@/utils/day';
import Period from '@/utils/period';
import DateTime from '@/utils/datetime';
import apiSettings, { MaterialDisplayMode, ReturnInventoryMode } from '@/stores/api/settings';

import type { Module, ActionContext } from 'vuex';
import type { OpeningDay, Settings } from '@/stores/api/settings';

export type State = Settings;

const getDefaults = (): Settings => ({
    general: {
        openingHours: [],
    },
    eventSummary: {
        customText: {
            title: null,
            content: null,
        },
        materialDisplayMode: MaterialDisplayMode.SUB_CATEGORIES,
        showLegalNumbers: true,
        showReplacementPrices: true,
        showDescriptions: false,
        showTags: false,
        showPictures: false,
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
    getters: {
        isOpen: (state: State) => (date: Day | DateTime) => (
            state.general.openingHours.some((openingDay: OpeningDay) => {
                // - Si la date comparée est à `00:00:00`, on regarde si on a pas une heure
                //   de fermeture pour le jour précédent à `24:00:00`.
                const shouldCheckYesterdayMidnight = (
                    date instanceof DateTime &&
                    date.isStartOfDay() &&
                    openingDay.weekday === date.subDay().get('day')
                );
                if (shouldCheckYesterdayMidnight && /^24:00(?::00(?:\.000)?)?$/.test(openingDay.end_time)) {
                    return true;
                }

                const isOpenDay = openingDay.weekday === date.get('day');
                if (!isOpenDay || date instanceof Day) {
                    return isOpenDay;
                }

                const openingPeriod = new Period(
                    date.setTime(openingDay.start_time),
                    date.setTime(openingDay.end_time),
                );
                return date.isBetween(openingPeriod, '[]');
            })
        ),
    },
    mutations: {
        reset(state: State) {
            Object.assign(state, getDefaults());
        },
        set(state: State, data: State) {
            Object.assign(state, data);
        },
    },
    actions: {
        async boot({ dispatch }: ActionContext<State, any>) {
            await dispatch('fetch');

            const refresh = async (): Promise<void> => {
                await dispatch('fetch');
            };
            setInterval(refresh, 30_000); // - 30 secondes.
        },

        async fetch({ commit }: ActionContext<State, any>) {
            commit('set', await apiSettings.all());
        },

        reset({ commit }: ActionContext<State, any>) {
            commit('reset');
        },
    },
};

export default store;
