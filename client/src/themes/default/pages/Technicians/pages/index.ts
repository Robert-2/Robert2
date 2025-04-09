import Listing from './Listing';
import Timeline from './Timeline';
import store from '@/themes/default/globals/store';
import { TechniciansViewMode } from '@/stores/api/users';

import type { RouteConfig } from 'vue-router';
import type { Session } from '@/stores/api/session';

const pages: RouteConfig[] = [
    {
        name: 'technicians',
        path: '',
        redirect: () => {
            const defaultView = store.getters['auth/isLogged']
                ? ((store.state as any).auth.user as Session).default_technicians_view
                : TechniciansViewMode.LISTING;

            return { name: `technicians:${defaultView}` };
        },
    },
    {
        name: `technicians:${TechniciansViewMode.TIMELINE}`,
        path: 'timeline',
        component: Timeline,
    },
    {
        name: `technicians:${TechniciansViewMode.LISTING}`,
        path: 'listing',
        component: Listing,
    },
];

export default pages;
