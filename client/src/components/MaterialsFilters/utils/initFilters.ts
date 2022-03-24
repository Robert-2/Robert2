import isValidInteger from '@/utils/isValidInteger';

type QueryData = {
    park?: string,
    category?: string,
    subCategory?: string,
    tags?: string,
};

type MaterialsFilters = {
    park: string,
    category: string,
    subCategory: string,
    tags: string[],
};

type MaterialsFiltersParams = {
    park?: number,
    category?: number,
    subCategory?: number,
    tags?: string[],
};

/**
 * Initialise les filtres pour les champs de filtrage du matériel
 *
 * @param query L'objet `query` de la route actuelle
 * @returns Un objet correctement formaté pour les filtres
 */
const initFilters = (query: QueryData): MaterialsFilters => {
    const storedFiltersData = localStorage.getItem(`materialsFilters`);
    const storedFilters: MaterialsFilters | undefined = JSON.parse(storedFiltersData || '');

    const filters: MaterialsFilters = {
        park: query.park || storedFilters?.park || '',
        category: query.category || storedFilters?.category || '',
        subCategory: query.subCategory || storedFilters?.subCategory || '',
        tags: query.tags ? JSON.parse(query.tags) : (storedFilters?.tags || []),
    };

    // - S'il n'y a que le parc de défini dans la query, on réinitialise les autres
    // - filtres, pour que les liens depuis la page des parcs fonctionnent comme voulu.
    if (query.park && !query.category && !query.subCategory && !query.tags) {
        filters.category = '';
        filters.subCategory = '';
        filters.tags = [];
        localStorage.setItem(`materialsFilters`, JSON.stringify(
            { park: query.park, category: '', subCategory: '', tags: [] },
        ));
    }

    return filters;
};

/**
 * Récupère les paramètres de requête API permettant de filtrer le matériel
 *
 * @param query L'objet `query` de la route actuelle
 * @returns Un objet correctement formaté pour les paramètres de requête API
 */
const getFiltersParams = (query: QueryData): MaterialsFiltersParams => {
    const filters = initFilters(query);

    const params: MaterialsFiltersParams = {};
    if (filters.park && isValidInteger(filters.park)) {
        params.park = Number.parseInt(filters.park, 10);
    }
    if (filters.category && isValidInteger(filters.category)) {
        params.category = Number.parseInt(filters.category, 10);
    }
    if (filters.subCategory && isValidInteger(filters.subCategory)) {
        params.subCategory = Number.parseInt(filters.subCategory, 10);
    }
    if (filters.tags) {
        params.tags = filters.tags || [];
    }

    return params;
};

export { initFilters, getFiltersParams };
