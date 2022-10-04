import apiCategories from '@/stores/api/categories';
import formatOptions from '@/utils/formatOptions';

export default {
    namespaced: true,
    state: {
        list: [],
        isFetched: false,
        error: null,
    },
    getters: {
        options: (state) => formatOptions(state.list),

        categoryName: (state) => (categoryId) => {
            const category = state.list.find((_category) => _category.id === categoryId);
            return category ? category.name : null;
        },

        subCategoryName: (state) => (subCategoryId) => {
            let name = null;
            state.list.forEach((category) => {
                if (!name) {
                    const subCategory = category.sub_categories.find(
                        (_subCategory) => _subCategory.id === subCategoryId,
                    );
                    name = subCategory ? subCategory.name : null;
                }
            });
            return name;
        },
    },
    mutations: {
        init(state, data) {
            state.list = data;
            state.isFetched = true;
            state.error = null;
        },

        setError(state, errorData) {
            state.error = errorData;
        },
    },
    actions: {
        async fetch({ state, commit }) {
            if (state.isFetched) {
                return;
            }

            try {
                commit('init', await apiCategories.all());
            } catch (error) {
                commit('setError', error);
            }
        },

        async refresh({ state, commit }) {
            state.isFetched = false;

            try {
                commit('init', await apiCategories.all());
            } catch (error) {
                commit('setError', error);
            }
        },
    },
};
