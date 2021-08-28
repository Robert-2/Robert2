/* eslint-disable import/no-cycle */

import requester from '@/globals/requester';
import formatOptions from '@/utils/formatOptions';

export default {
    namespaced: true,
    state: {
        list: [],
        isFetched: false,
        error: null,
    },
    getters: {
        options: (state, getters, rootState) => {
            const { locale, translations } = rootState.i18n;
            return formatOptions(state.list, null, translations[locale]['please-choose']);
        },

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
        fetch({ state, commit }) {
            if (state.isFetched) {
                return;
            }

            requester.get('categories')
                .then(({ data }) => {
                    commit('init', data.data);
                })
                .catch((error) => {
                    commit('setError', error);
                });
        },

        refresh({ state, commit }) {
            state.isFetched = false;

            requester.get('categories')
                .then(({ data }) => {
                    commit('init', data.data);
                })
                .catch((error) => {
                    commit('setError', error);
                });
        },
    },
};
