import Period from '@/utils/period';
import parseInteger from '@/utils/parseInteger';
import isValidInteger from '@/utils/isValidInteger';
import { FiltersSchema } from './components/Filters';
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

    // - Rôle.
    if ('role' in routeQuery && isValidInteger(routeQuery.role)) {
        filters.role = parseInteger(routeQuery.role);
    }

    // - Période de disponibilité.
    if ('availability_period_start' in routeQuery && 'availability_period_end' in routeQuery) {
        const parsedPeriod = Period.tryFrom({
            start: routeQuery.availability_period_start,
            end: routeQuery.availability_period_end,
            isFullDays: true,
        });
        if (parsedPeriod !== null) {
            filters.availabilityPeriod = parsedPeriod;
        }
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

    // - Période de disponibilité.
    if (filters.availabilityPeriod !== null) {
        const serializedPeriod = filters.availabilityPeriod.toSerialized();
        query.availability_period_start = serializedPeriod.start;
        query.availability_period_end = serializedPeriod.end;
    }

    return query;
};

//
// - Persistence
//

/** La clé utilisé pour la persistence des filtres de la page. */
const FILTERS_PERSISTENCE_KEY = `TechniciansListing--filters`;

export const getPersistedFilters = (): Partial<Filters> | null => (
    getPersistedFiltersCore(FILTERS_PERSISTENCE_KEY, FiltersSchema)
);

export const persistFilters = (filters: Filters): void => {
    persistFiltersCore(FILTERS_PERSISTENCE_KEY, filters);
};

export const clearPersistedFilters = (): void => {
    clearPersistedFiltersCore(FILTERS_PERSISTENCE_KEY);
};
