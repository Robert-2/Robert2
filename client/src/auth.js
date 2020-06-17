/* eslint-disable import/no-cycle */
import router from '@/router';
import store from './store';

export default {
  is: { authenticated: false },

  login(context, credentials) {
    context.$http.post('token', credentials)
      .then(({ data }) => {
        window.sessionStorage.setItem('token', data.token);

        this.is.authenticated = true;
        const { user } = data;
        store.commit('user/init', user);

        const userLocale = user.settings.language.toLowerCase();
        context.$i18n.set(userLocale);
        window.localStorage.setItem('userLocale', userLocale);

        const lastVisited = window.localStorage.getItem('lastVisited');
        const redirect = (!lastVisited || lastVisited === '/login') ? '/' : lastVisited;
        router.replace(redirect || '/');
      })
      .catch((error) => {
        if (!error.response) {
          context.errorMessage({ code: 0, message: 'network error' });
          return;
        }

        const { status, data } = error.response;
        const code = (status === 404 && !data.error) ? 0 : 404;
        const message = data.error ? data.error.message : 'network error';
        context.errorMessage({ code, message });
      });
  },

  // - Possible modes: `expired` | `bye` | `restricted`
  logout({ mode } = { mode: null }) {
    store.commit('user/reset');

    window.sessionStorage.clear();
    this.is.authenticated = false;

    router.replace({ path: '/login', hash: mode }).catch(() => {});
  },

  checkAuth() {
    const token = window.sessionStorage.getItem('token');
    if (!token) {
      this.logout();
      return;
    }

    this.is.authenticated = true;
    const redirect = window.localStorage.getItem('lastVisited');
    router.replace(redirect || 'calendar');
  },
};
