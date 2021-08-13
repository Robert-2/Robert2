/* eslint-disable import/prefer-default-export */

import isValidInteger from '@/utils/isValidInteger';

export const normalizeFilters = (rawFilters, extended = true) => {
    const filters = extended
    // eslint-disable-next-line object-curly-newline
        ? { park: null, category: null, subCategory: null, tags: [] }
        : {};

    if ('onlySelected' in rawFilters) {
        filters.onlySelected = !!rawFilters.onlySelected;
    }

    if ('tags' in rawFilters && Array.isArray(rawFilters.tags)) {
        filters.tags = rawFilters.tags;
    }

    ['park', 'category', 'subCategory'].forEach((key) => {
        if (key in rawFilters && isValidInteger(rawFilters[key])) {
            filters[key] = parseInt(rawFilters[key], 10);
        }
    });

    return filters;
};
