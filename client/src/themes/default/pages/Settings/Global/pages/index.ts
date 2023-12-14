import EventSummarySettings from './EventSummary';
import CalendarSettings from './Calendar';
import InventoriesSettings from './Inventories';

import type { RouteConfig } from 'vue-router';

export type Page = (
    & RouteConfig
    & {
        meta: {
            icon: string,
            title: string,
        },
    }
);

const pages: Page[] = [
    {
        name: 'global-settings',
        path: '',
        component: CalendarSettings,
        meta: {
            icon: 'calendar-alt',
            title: 'page.settings.calendar.title',
        },
    },
    {
        name: 'global-settings:event-summary',
        path: 'event-summary',
        component: EventSummarySettings,
        meta: {
            icon: 'print',
            title: 'page.settings.event-summary.title',
        },
    },
    {
        name: 'global-settings:inventories',
        path: 'inventories',
        component: InventoriesSettings,
        meta: {
            icon: 'tasks',
            title: 'page.settings.inventories.title',
        },
    },
];

export default pages;
