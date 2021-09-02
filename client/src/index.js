import './index.scss';
import Vue from 'vue';
import moment from 'moment';
import vuexI18n from 'vuex-i18n';
import VueJsModal from 'vue-js-modal/dist/index.nocss';
import { VTooltip } from 'v-tooltip';
import { ClientTable, ServerTable } from 'vue-tables-2';
import Toasted from 'vue-toasted';

import config from '@/globals/config';
import requester from '@/globals/requester';
import store from '@/globals/store';
import router from '@/globals/router';
import translations from '@/locale';
import vueTableTranslations from '@/locale/vendors/vue-tables';
import App from '@/components/App';

Vue.config.productionTip = false;

// HTTP (ajax) lib
Vue.prototype.$http = requester;

// Modal
Vue.use(VueJsModal, {
    dialog: true,
    dynamic: true,
    dynamicDefaults: {
        width: 900,
        height: 'auto',
        adaptive: true,
        minHeight: 300,
        draggable: false,
    },
});

// Tooltips
VTooltip.options.defaultContainer = '#app';
VTooltip.options.disposeTimeout = 1000;
VTooltip.options.defaultDelay = 100;
Vue.directive('tooltip', VTooltip);

// Internationalization
Vue.use(vuexI18n.plugin, store);

Object.keys(translations).forEach((lang) => {
    Vue.i18n.add(lang, translations[lang]);
});

let currentLocale = config.defaultLang;

Vue.i18n.set(currentLocale);

const savedLocale = localStorage.getItem('userLocale');
if (savedLocale && Vue.i18n.localeExists(savedLocale)) {
    Vue.i18n.set(savedLocale);
    currentLocale = savedLocale;
}
Vue.i18n.fallback(currentLocale);

moment.locale(currentLocale);

// Magic tables (order, pagination)
const tablesConfig = {
    columnsClasses: { actions: 'VueTables__actions' },
    sortIcon: {
        base: 'fas',
        up: 'fa-sort-up',
        down: 'fa-sort-down',
        is: 'fa-sort',
    },
    texts: vueTableTranslations[currentLocale],
    requestKeys: { query: 'search' },
    perPage: config.defaultPaginationLimit,
    perPageValues: [config.defaultPaginationLimit],
    responseAdapter: (response) => {
        if (!response) {
            return { data: [], count: 0 };
        }
        const { data, pagination } = response.data;
        return { data, count: pagination ? pagination.total : 0 };
    },
};
Vue.use(ClientTable, tablesConfig);
Vue.use(ServerTable, tablesConfig, true);

// Toast notifications
Vue.use(Toasted, {
    duration: 5000,
    position: 'bottom-right',
    className: 'Notification',
    action: {
        text: Vue.i18n.translate('close'),
        onClick: (e, toastObject) => {
            toastObject.goAway(0);
        },
    },
});

store.dispatch('auth/fetch').then(() => {
    /* eslint-disable no-new */
    new Vue({
        el: '#app',
        store,
        router,
        render() {
            return (
                <div id="app">
                    <App />
                </div>
            );
        },
    });
});
