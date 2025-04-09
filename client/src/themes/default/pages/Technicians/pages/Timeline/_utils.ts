import Day from '@/utils/day';
import Period from '@/utils/period';
import parseInteger from '@/utils/parseInteger';
import isValidInteger from '@/utils/isValidInteger';
import { FiltersSchema } from './components/Filters';
import { TIMELINE_PERIOD_STORAGE_KEY } from './_constants';
import {
    persistFilters as persistFiltersCore,
    getPersistedFilters as getPersistedFiltersCore,
    clearPersistedFilters as clearPersistedFiltersCore,
} from '@/utils/filtersPersister';

import type { Route } from 'vue-router';
import type { Filters } from './components/Filters';

export const getDefaultPeriod = (): Period => {
    const savedPeriod = localStorage.getItem(TIMELINE_PERIOD_STORAGE_KEY);
    if (savedPeriod !== null) {
        try {
            return Period.fromSerialized(JSON.parse(savedPeriod));
        } catch {
            // -
        }
    }

    return new Period(
        Day.today().subDay(3),
        Day.today().addDay(3),
        true,
    );
};

export const getCenterDateFromPeriod = (period: Period): Day => {
    const normalizedPeriod = period.setFullDays(false);
    const duration = normalizedPeriod.end.diff(normalizedPeriod.start, 'hour');
    return new Day(normalizedPeriod.start.add(duration / 2, 'hours'));
};

export const getFiltersFromRoute = (route: Route): Partial<Filters> | undefined => {
    const routeQuery = route?.query ?? {};
    const filters: Partial<Filters> = {};

    // - Recherche textuelle.
    if ('search' in routeQuery && Array.isArray(routeQuery.search)) {
        filters.search = routeQuery.search
            .map((term: string | null) => (term ?? '').trim())
            .filter((term: string) => term !== '');
    }

    // - Rôle.
    if ('role' in routeQuery && isValidInteger(routeQuery.role)) {
        filters.role = parseInteger(routeQuery.role);
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
};

export const convertFiltersToRouteQuery = (filters: Filters): Route['query'] => {
    const query: Route['query'] = {};

    // - Recherche textuelle.
    if (filters.search.length > 0) {
        query.search = filters.search;
    }

    // - Rôle.
    if (filters.role !== null) {
        query.role = filters.role.toString();
    }

    return query;
};

//
// - Persistence
//

/** La clé utilisé pour la persistence des filtres de la page. */
const FILTERS_PERSISTENCE_KEY = `TechniciansTimeline--filters`;

export const getPersistedFilters = (): Partial<Filters> | null => (
    getPersistedFiltersCore(FILTERS_PERSISTENCE_KEY, FiltersSchema)
);

export const persistFilters = (filters: Filters): void => {
    persistFiltersCore(FILTERS_PERSISTENCE_KEY, filters);
};

export const clearPersistedFilters = (): void => {
    clearPersistedFiltersCore(FILTERS_PERSISTENCE_KEY);
};
