import authStore from '@/stores/auth';
import settingsStore from '@/stores/settings';
import parksStore from './parks';
import categoriesStore from './categories';
import tagsStore from './tags';

export default {
    parks: parksStore,
    categories: categoriesStore,
    tags: tagsStore,
    auth: authStore,
    settings: settingsStore,
};
