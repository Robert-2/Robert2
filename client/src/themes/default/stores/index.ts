import globalStores from '@/stores';
import parksStore from './parks';
import categoriesStore from './categories';
import countriesStore from './countries';
import tagsStore from './tags';
import degressiveRatesStore from './degressive-rates';
import taxesStore from './taxes';
import groupsStore from './groups';
import rolesStore from './roles';

export default {
    ...globalStores,
    parks: parksStore,
    categories: categoriesStore,
    countries: countriesStore,
    tags: tagsStore,
    degressiveRates: degressiveRatesStore,
    taxes: taxesStore,
    groups: groupsStore,
    roles: rolesStore,
};
