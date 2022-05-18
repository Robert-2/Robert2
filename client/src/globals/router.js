import Vue from 'vue';
import Router from 'vue-router';
import store from '@/globals/store';
import { APP_NAME } from '@/globals/constants';
import routes from '@/pages';

Vue.use(Router);

const router = new Router({ mode: 'history', routes });

router.beforeEach((to, from, next) => {
    let restrictAccess = false;

    const requiresAuth = to.matched.reduce(
        (currentState, { meta }) => {
            // - Non indiqué explicitement => Route publique.
            if (meta.requiresAuth == null) {
                return currentState;
            }

            // - Marqué à `true` (ou valeur truthy) => Authentification requise.
            if (meta.requiresAuth) {
                return true;
            }

            // - Marqué à `false` (ou valeur falsy) => Route pour visiteurs.
            //   (uniquement si l'état courant n'est pas déjà marqué comme "authentification requise")
            //   (= l'authentification requise l'emporte sur la route visiteur)
            if (currentState === null && !meta.requiresAuth) {
                return false;
            }

            return currentState;
        },
        null,
    );

    const { title, requiresGroups } = to.matched[0].meta;

    if (title) {
        const translatedName = Vue.i18n.translate(title, { pageSubTitle: '' });
        document.title = `${translatedName} − ${APP_NAME}`;
    } else {
        document.title = APP_NAME;
    }

    const isLogged = store.getters['auth/isLogged'];
    if (requiresAuth && !isLogged) {
        next('/login');
        return;
    }

    if (!requiresAuth) {
        if (requiresAuth === false && isLogged) {
            next('/');
            return;
        }

        next();
        return;
    }

    if (requiresGroups && requiresGroups.length) {
        if (!isLogged) {
            next('/login');
            return;
        }

        const { groupId } = store.state.auth.user;
        if (!requiresGroups.includes(groupId)) {
            restrictAccess = true;
        }
    }

    if (restrictAccess) {
        store.dispatch('auth/logout').then(() => {
            next({ path: '/login', hash: '#restricted' });
        });
        return;
    }

    next();
});

router.afterEach(({ name, matched }) => {
    if (name === 'login') {
        return;
    }

    const { title } = matched[0].meta;
    store.commit('setPageTitle', title ?? '');
});

export default router;
