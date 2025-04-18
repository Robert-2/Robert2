import Calendar from './Calendar';
import Listing from './Listing';
import { BookingsViewMode } from '@/stores/api/users';
import store from '@/themes/default/globals/store';

import type { RouteConfig } from 'vue-router';
import type { Session } from '@/stores/api/session';

const pages: RouteConfig[] = [
    {
        name: 'schedule',
        path: '',
        redirect: () => {
            const defaultView = store.getters['auth/isLogged']
                ? ((store.state as any).auth.user as Session).default_bookings_view
                : BookingsViewMode.CALENDAR;

            return { name: `schedule:${defaultView}` };
        },
    },
    {
        name: `schedule:${BookingsViewMode.CALENDAR}`,
        path: 'calendar',
        component: Calendar,
    },
    {
        name: `schedule:${BookingsViewMode.LISTING}`,
        path: 'listing',
        component: Listing,
    },
];

export default pages;
