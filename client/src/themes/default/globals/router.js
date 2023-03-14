import Vue from 'vue';
import Router from 'vue-router';
import { APP_NAME } from '@/globals/constants';
import routes from '@/themes/default/pages';
import store from './store';

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
        // - Si l'authentification est marquée explicitement comme non requise (= `false`).
        //   => Redirige vers l'accueil si authentifié car la route ne peut être accédée que
        //      par les utilisateurs non connectés.
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

        const { group } = store.state.auth.user;
        if (!requiresGroups.includes(group)) {
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
