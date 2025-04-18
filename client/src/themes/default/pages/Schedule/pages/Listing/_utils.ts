import Period from '@/utils/period';
import parseInteger from '@/utils/parseInteger';
import isValidInteger from '@/utils/isValidInteger';
import { UNCATEGORIZED } from '@/stores/api/materials';
import { FiltersSchema, StateFilter } from './components/Filters';
import {
    persistFilters as persistFiltersCore,
    getPersistedFilters as getPersistedFiltersCore,
    clearPersistedFilters as clearPersistedFiltersCore,
} from '@/utils/filtersPersister';

import type { Route } from 'vue-router';
import type { Filters } from './components/Filters';

export const getFiltersFromRoute = (route: Route): Partial<Filters> | undefined => {
    const routeQuery = route?.query ?? {};
    const filters: Partial<Filters> = {};

    // - Recherche textuelle.
    if ('search' in routeQuery && Array.isArray(routeQuery.search)) {
        filters.search = routeQuery.search
            .map((term: string | null) => (term ?? '').trim())
            .filter((term: string) => term !== '');
    }

    // - Parc.
    if ('park' in routeQuery && isValidInteger(routeQuery.park)) {
        filters.park = parseInteger(routeQuery.park);
    }

    // - Catégorie.
    if ('category' in routeQuery) {
        if (routeQuery.category === UNCATEGORIZED) {
            filters.category = UNCATEGORIZED;
        } else if (isValidInteger(routeQuery.category)) {
            filters.category = parseInteger(routeQuery.category)!;
        }
    }

    // - Période.
    if ('period_start' in routeQuery && 'period_end' in routeQuery) {
        const parsedPeriod = Period.tryFrom({
            start: routeQuery.period_start,
            end: routeQuery.period_end,
            isFullDays: true,
        });
        if (parsedPeriod !== null) {
            filters.period = parsedPeriod;
        }
    }

    // - États.
    if ('states' in routeQuery && Array.isArray(routeQuery.states)) {
        filters.states = routeQuery.states.filter((rawState: string | null) => (
            rawState !== null &&
            (Object.values(StateFilter) as string[]).includes(rawState)
        )) as StateFilter[];
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
};

export const convertFiltersToRouteQuery = (filters: Filters): Route['query'] => {
    const query: Route['query'] = {};

    // - Recherche textuelle.
    if (filters.search.length > 0) {
        query.search = filters.search;
    }

    // - Parc.
    if (filters.park !== null) {
        query.park = filters.park.toString();
    }

    // - Catégorie.
    if (filters.category !== null) {
        query.category = filters.category.toString();
    }

    // - Période.
    if (filters.period !== null) {
        const serializedPeriod = filters.period.toSerialized();
        query.period_start = serializedPeriod.start;
        query.period_end = serializedPeriod.end;
    }

    // - States
    if (filters.states.length > 0) {
        query.states = filters.states;
    }

    return query;
};

//
// - Persistence
//

/** La clé utilisé pour la persistence des filtres de la page. */
const FILTERS_PERSISTENCE_KEY = `ScheduleListing--filters`;

export const getPersistedFilters = (): Partial<Filters> | null => (
    getPersistedFiltersCore(FILTERS_PERSISTENCE_KEY, FiltersSchema)
);

export const persistFilters = (filters: Filters): void => {
    persistFiltersCore(FILTERS_PERSISTENCE_KEY, filters);
};

export const clearPersistedFilters = (): void => {
    clearPersistedFiltersCore(FILTERS_PERSISTENCE_KEY);
};
