import requester from '@/globals/requester';
import Config from '@/globals/config';
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
                const { data } = await requester.get('/session');
                commit('setUser', normalizeUser(data));
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
            const { data } = await requester.post('session', credentials);
            commit('setUser', normalizeUser(data.user));
            setSessionCookie(data.token);

            const userLocale = data.user.settings.language.toLowerCase();
            window.localStorage.setItem('userLocale', userLocale);
            dispatch('i18n/setLocale', { locale: userLocale }, { root: true });
        },
        async logout({ commit }) {
            const hasPotentiallyStatefulSession = !!Config.auth.isCASEnabled;

            if (hasPotentiallyStatefulSession) {
                window.location.assign(`${Config.baseUrl}/logout`);

                // - Timeout de 5 secondes avant de rejeter la promise.
                // => L'idée étant que la redirection doit avoir lieu dans ce labs de temps.
                // => Cela permet aussi de "bloquer" les listeners de cette méthodes pour éviter
                //    qu'ils executent des process post-logout (redirection, vidage de store ...)
                await new Promise((_, reject) => { setTimeout(reject, 5000); });
            }

            commit('setUser', null);
            commit('parks/reset', undefined, { root: true });

            Cookies.remove(Config.auth.cookie);
        },
    },
};
