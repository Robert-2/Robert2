import apiTags from '@/stores/api/tags';
import config from '@/globals/config';
import formatOptions from '@/utils/formatOptions';

export default {
    namespaced: true,
    state: {
        list: [],
        isFetched: false,
        error: null,
        protected: [
            config.beneficiaryTagName.toLowerCase(),
            config.technicianTagName.toLowerCase(),
        ],
    },
    getters: {
        options: (state, getters) => formatOptions(
            state.list.filter((tag) => !getters.isProtected(tag.name)),
        ),

        publicList: (state, getters) => state.list.filter(
            (tag) => !getters.isProtected(tag.name),
        ),

        isProtected: (state) => (tagName) => (
            state.protected.includes(tagName.toLowerCase())
        ),

        tagName: (state) => (tagId) => {
            const tag = state.list.find((_tag) => _tag.id === tagId);
            return tag ? tag.name : null;
        },
    },
    mutations: {
        set(state, data) {
            state.list = data;
            state.isFetched = true;
            state.error = null;
        },

        setError(state, errorData) {
            state.error = errorData;
        },
    },
    actions: {
        async fetch({ commit }) {
            try {
                const data = await apiTags.all();
                commit('set', data);
            } catch (error) {
                commit('setError', error);
            }
        },
    },
};
