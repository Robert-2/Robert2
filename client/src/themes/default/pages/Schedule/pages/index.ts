import Calendar from './Calendar';
import Listing from './Listing';
import store from '@/themes/default/globals/store';

import type { RouteConfig } from 'vue-router';

const pages: RouteConfig[] = [
    {
        name: 'schedule',
        path: '',
        redirect: () => {
            const { default_bookings_view: defaultBookingsView } = store.getters['auth/user'];
            return { name: `schedule:${defaultBookingsView}` };
        },
    },
    {
        name: 'schedule:calendar',
        path: 'calendar',
        component: Calendar,
    },
    {
        name: 'schedule:listing',
        path: 'listing',
        component: Listing,
    },
];

export default pages;
