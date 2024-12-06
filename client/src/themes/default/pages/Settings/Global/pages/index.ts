import config, { BillingMode } from '@/globals/config';
import isTruthy from '@/utils/isTruthy';
import EventSummarySettings from './EventSummary';
import CategoriesSettings from './Categories';
import TagsSettings from './Tags';
import CalendarSettings from './Calendar';
import InventoriesSettings from './Inventories';
import TaxesSettings from './Taxes';
import DegressiveRatesSettings from './DegressiveRates';

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
        name: 'global-settings:categories',
        path: 'categories',
        component: CategoriesSettings,
        meta: {
            icon: 'sitemap',
            title: 'page.settings.categories.title',
        },
    },
    {
        name: 'global-settings:tags',
        path: 'tags',
        component: TagsSettings,
        meta: {
            icon: 'tags',
            title: 'page.settings.tags.title',
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
    config.billingMode !== BillingMode.NONE && {
        name: 'global-settings:taxes',
        path: 'taxes',
        component: TaxesSettings,
        meta: {
            icon: 'percentage',
            title: 'page.settings.taxes.title',
        },
    },
    config.billingMode !== BillingMode.NONE && {
        name: 'global-settings:degressive-rates',
        path: 'degressive-rates',
        component: DegressiveRatesSettings,
        meta: {
            icon: 'funnel-dollar',
            title: 'page.settings.degressive-rates.title',
        },
    },
].filter(isTruthy);

export default pages;
