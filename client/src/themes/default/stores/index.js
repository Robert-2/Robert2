import authStore from '@/stores/auth';
import settingsStore from '@/stores/settings';
import parksStore from './parks';
import categoriesStore from './categories';
import countriesStore from './countries';
import tagsStore from './tags';

export default {
    parks: parksStore,
    categories: categoriesStore,
    countries: countriesStore,
    tags: tagsStore,
    auth: authStore,
    settings: settingsStore,
};
