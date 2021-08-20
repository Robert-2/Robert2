/* eslint-disable import/no-cycle */

import axios from '@/axios';
import Config from '@/config/globalConfig';
import formatOptions from '@/utils/formatOptions';

export default {
    namespaced: true,
    state: {
        list: [],
        isFetched: false,
        error: null,
        protected: [
            Config.beneficiaryTagName.toLowerCase(),
            Config.technicianTagName.toLowerCase(),
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

            axios.get('tags')
                .then(({ data }) => {
                    commit('init', data.data);
                })
                .catch((error) => {
                    commit('setError', error);
                });
        },

        refresh({ state, commit }) {
            state.isFetched = false;

            axios.get('tags')
                .then(({ data }) => {
                    commit('init', data.data);
                })
                .catch((error) => {
                    commit('setError', error);
                });
        },
    },
};
