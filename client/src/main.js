import Vue from 'vue';
import moment from 'moment';
import vuexI18n from 'vuex-i18n';
import VueJsModal from 'vue-js-modal/dist/index.nocss';
import { VTooltip } from 'v-tooltip';
import { ClientTable, ServerTable } from 'vue-tables-2';
import Toasted from 'vue-toasted';

import Config from '@/config/globalConfig';
import axios from '@/axios';
import store from '@/store';
import translations from '@/locale';
import vueTableTranslations from '@/locale/vendors/vue-tables';
import router from '@/router';
import App from '@/App.vue';

// CSS vendors libraries
import 'vue-js-modal/dist/styles.css';

require('@fortawesome/fontawesome-free/css/all.css');

Vue.config.productionTip = false;

// HTTP (ajax) lib
Vue.prototype.$http = axios;

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

let currentLocale = Config.defaultLang;

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
    perPage: Config.defaultPaginationLimit,
    perPageValues: [Config.defaultPaginationLimit],
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
        components: { App },
        template: '<App/>',
    });
});
