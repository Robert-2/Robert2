/* eslint-disable import/no-cycle */

import axios from '@/axios';
import Config from '@/config/globalConfig';
import Cookies from '@/utils/cookies';

const normalizeUser = (rawData) => ({
  id: rawData.id,
  groupId: rawData.group_id,
  firstName: rawData.first_name,
  lastName: rawData.last_name,
  pseudo: rawData.pseudo,
  email: rawData.email,
  locale: rawData.settings ? rawData.settings.language : 'en',
  restrictedParks: rawData.restricted_parks,
});

const setSessionCookie = (token) => {
  const { cookie, timeout } = Config.auth;

  const cookieConfig = {};
  if (timeout) {
    const timeoutMs = timeout * 60 * 60 * 1000;
    const timeoutDate = new Date(new Date().getTime() + timeoutMs);
    cookieConfig.expires = timeoutDate;
  }

  Cookies.set(cookie, token, cookieConfig);
};

export default {
  namespaced: true,
  state: {
    user: null,
  },
  getters: {
    isLogged: (state) => !!state.user,
    is: (state) => (groups) => {
      if (!state.user) {
        return false;
      }

      const normalizedGroups = Array.isArray(groups) ? groups : [groups];
      return normalizedGroups.includes(state.user.groupId);
    },
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setUserProfile(state, newInfos) {
      state.user.firstName = newInfos.first_name;
      state.user.lastName = newInfos.last_name;
      state.user.pseudo = newInfos.pseudo;
      state.user.email = newInfos.email;
    },
    setLocale(state, locale) {
      state.user.locale = locale;
    },
  },
  actions: {
    async fetch({ dispatch, commit }) {
      if (!Cookies.get(Config.auth.cookie)) {
        commit('setUser', null);
        return;
      }

      try {
        const { data } = await axios.get('/session');
        commit('setUser', normalizeUser(data));
      } catch (error) {
        // - Non connecté.
        if (error.httpCode === 401 /* Unauthorized */) {
          dispatch('logout');
        } else {
          console.error('Error:', error.message || error.code);
        }
      }
    },
    async login({ dispatch, commit }, credentials) {
      const { data } = await axios.post('session', credentials);
      commit('setUser', normalizeUser(data.user));
      setSessionCookie(data.token);

      const userLocale = data.user.settings.language.toLowerCase();
      window.localStorage.setItem('userLocale', userLocale);
      dispatch('i18n/setLocale', { locale: userLocale }, { root: true });
    },
    logout({ commit }) {
      commit('setUser', null);
      commit('parks/reset', undefined, { root: true });

      Cookies.remove(Config.auth.cookie);
    },
  },
};
