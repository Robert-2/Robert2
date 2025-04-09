import HttpCode from 'status-code-enum';
import config from '@/globals/config';
import cookies from '@/utils/cookies';
import { isRequestErrorStatusCode } from '@/utils/errors';
import apiSession from '@/stores/api/session';

import type { Module, ActionContext } from 'vuex';
import type { Session, Credentials } from '@/stores/api/session';
import type { Group } from '@/stores/api/groups';
import type { UserSettings } from '@/stores/api/users';
import type { RootState } from '.';

export type State = {
    user: Session | null,
};

const setSessionCookie = (token: string): void => {
    const { cookie, timeout } = config.auth;

    const cookieConfig: Cookies.CookieAttributes = {
        secure: config.isSslEnabled,

        // - Note: Permet la création de cookies lorsque Loxya est
        //   intégré dans des systèmes tiers (e.g. Notion).
        sameSite: config.isSslEnabled ? 'None' : 'Lax',
    };

    if (timeout) {
        const timeoutMs = timeout * 60 * 60 * 1000;
        const timeoutDate = new Date(Date.now() + timeoutMs);
        cookieConfig.expires = timeoutDate;
    }

    cookies.set(cookie, token, cookieConfig);
};

const store: Module<State, RootState> = {
    namespaced: true,
    state: {
        user: null,
    },
    getters: {
        isLogged: (state: State) => !!state.user,

        is: (state: State) => (groups: Group | Group[]) => {
            if (!state.user) {
                return false;
            }

            const normalizedGroups = Array.isArray(groups) ? groups : [groups];
            return normalizedGroups.includes(state.user.group);
        },

        user: (state: State) => state.user,
    },
    mutations: {
        setUser(state: State, user: Session) {
            state.user = user;
        },

        updateUser(state: State, newData: Session) {
            state.user = { ...state.user, ...newData };
        },

        setLocale(state: State, language: string) {
            state.user!.language = language;
        },

        setInterfaceSettings(state: State, settings: UserSettings) {
            state.user!.default_bookings_view = settings.default_bookings_view;
            state.user!.default_technicians_view = settings.default_technicians_view;
            state.user!.disable_contextual_popovers = settings.disable_contextual_popovers;
            state.user!.disable_search_persistence = settings.disable_search_persistence;
        },
    },
    actions: {
        async fetch({ dispatch, commit }: ActionContext<State, RootState>) {
            if (!cookies.get(config.auth.cookie)) {
                commit('setUser', null);
                return;
            }

            try {
                commit('setUser', await apiSession.get());
            } catch (error) {
                // - Non connecté.
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorUnauthorized)) {
                    dispatch('logout', false);
                } else {
                    // eslint-disable-next-line no-console
                    console.error('Unexpected error during user retrieval:', error);
                }
            }
        },

        async login({ dispatch, commit }: ActionContext<State, RootState>, credentials: Credentials) {
            const { token, ...user } = await apiSession.create(credentials);
            commit('setUser', user);
            setSessionCookie(token);

            window.localStorage.setItem('userLocale', user.language);
            await dispatch('i18n/setLocale', { locale: user.language }, { root: true });
            await dispatch('settings/fetch', undefined, { root: true });
        },

        async logout(_: ActionContext<State, RootState>, full: boolean = true) {
            const theme = '';

            if (full) {
                window.location.assign(`${config.baseUrl}${theme}/logout`);
            } else {
                cookies.remove(config.auth.cookie);
                window.location.assign(`${config.baseUrl}${theme}/login`);
            }

            // - Timeout de 5 secondes avant de rejeter la promise.
            // => L'idée étant que la redirection doit avoir lieu dans ce laps de temps.
            // => Cela permet aussi de "bloquer" les listeners de cette méthode pour éviter
            //    qu'ils exécutent des process post-logout (redirection, vidage de store ...)
            await new Promise((__: any, reject: any) => { setTimeout(reject, 5000); });
        },
    },
};

export default store;
