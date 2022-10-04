import config from '@/globals/config';
import cookies from '@/utils/cookies';
import apiSession from '@/stores/api/session';

const setSessionCookie = (token) => {
    const { cookie, timeout } = config.auth;

    const cookieConfig = {};
    if (timeout) {
        const timeoutMs = timeout * 60 * 60 * 1000;
        const timeoutDate = new Date(new Date().getTime() + timeoutMs);
        cookieConfig.expires = timeoutDate;
    }

    cookies.set(cookie, token, cookieConfig);
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
            return normalizedGroups.includes(state.user.group);
        },
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        updateUser(state, newData) {
            state.user = { ...state.user, ...newData };
        },
        setLocale(state, language) {
            state.user.language = language;
        },
    },
    actions: {
        async fetch({ dispatch, commit }) {
            if (!cookies.get(config.auth.cookie)) {
                commit('setUser', null);
                return;
            }

            try {
                commit('setUser', await apiSession.get());
            } catch (error) {
                // - Non connecté.
                if (error.httpCode === 401 /* Unauthorized */) {
                    dispatch('logout');
                } else {
                    // eslint-disable-next-line no-console
                    console.error('Error:', error.message || error.code);
                }
            }
        },
        async login({ dispatch, commit }, credentials) {
            const { token, ...user } = await apiSession.create(credentials);
            commit('setUser', user);
            setSessionCookie(token);

            window.localStorage.setItem('userLocale', user.language);
            await dispatch('i18n/setLocale', { locale: user.language }, { root: true });
            await dispatch('settings/fetch', undefined, { root: true });
        },
        async logout({ dispatch, commit }) {
            const hasPotentiallyStatefulSession = false;

            if (hasPotentiallyStatefulSession) {
                window.location.assign(`${config.baseUrl}/logout`);

                // - Timeout de 5 secondes avant de rejeter la promise.
                // => L'idée étant que la redirection doit avoir lieu dans ce labs de temps.
                // => Cela permet aussi de "bloquer" les listeners de cette méthodes pour éviter
                //    qu'ils exécutent des process post-logout (redirection, vidage de store ...)
                await new Promise((_, reject) => { setTimeout(reject, 5000); });
            }

            commit('setUser', null);
            commit('parks/reset', undefined, { root: true });
            await dispatch('settings/reset', undefined, { root: true });

            cookies.remove(config.auth.cookie);
        },
    },
};
