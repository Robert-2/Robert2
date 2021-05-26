/* eslint-disable import/no-cycle */
import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';
import { APP_NAME } from '@/config/constants';
import Login from '@/pages/Login/Login.vue';
import UserProfile from '@/pages/UserProfile/UserProfile.vue';
import UserSettings from '@/pages/UserSettings/UserSettings.vue';
import Calendar from '@/pages/Calendar/Calendar.vue';
import Event from '@/pages/Event/Event.vue';
import EventReturn from '@/pages/EventReturn/EventReturn.vue';
import Users from '@/pages/Users/Users.vue';
import User from '@/pages/User/User.vue';
import Beneficiaries from '@/pages/Beneficiaries/Beneficiaries.vue';
import Beneficiary from '@/pages/Beneficiary/Beneficiary.vue';
import Company from '@/pages/Company/Company.vue';
import Materials from '@/pages/Materials/Materials.vue';
import Material from '@/pages/Material/Material.vue';
import MaterialUnit from '@/pages/MaterialUnit/MaterialUnit.vue';
import MaterialView from '@/pages/MaterialView/MaterialView.vue';
import Attributes from '@/pages/Attributes/Attributes.vue';
import Tags from '@/pages/Tags/Tags.vue';
import Technicians from '@/pages/Technicians/Technicians.vue';
import Technician from '@/pages/Technician/Technician.vue';
import Categories from '@/pages/Categories/Categories.vue';
import Parks from '@/pages/Parks/Parks.vue';
import Park from '@/pages/Park/Park.vue';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: 'page-login.title',
        requiresAuth: false,
      },
    },
    {
      path: '/profile',
      name: 'user-profile',
      component: UserProfile,
      meta: {
        resource: 'users',
        title: 'page-profile.title',
        readableName: 'page-profile.title',
        requiresAuth: true,
        requiresGroups: ['admin', 'member', 'visitor'],
      },
    },
    {
      path: '/settings',
      name: 'user-settings',
      component: UserSettings,
      meta: {
        resource: 'users',
        title: 'page-settings.title',
        readableName: 'page-settings.title',
        requiresAuth: true,
        requiresGroups: ['admin', 'member', 'visitor'],
      },
    },
    {
      path: '/',
      name: 'calendar',
      component: Calendar,
      meta: {
        resource: 'events',
        title: 'page-calendar.title',
        readableName: 'page-calendar.title',
        requiresAuth: true,
        requiresGroups: ['admin', 'member', 'visitor'],
      },
    },
    {
      path: '/events/new',
      name: 'addEvent',
      component: Event,
      meta: {
        resource: 'events',
        title: 'page-events.add',
        readableName: 'page-events.add',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/events/:id',
      name: 'editEvent',
      component: Event,
      meta: {
        resource: 'events',
        title: 'page-events.edit-event',
        readableName: 'page-events.edit',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/event-return/:id',
      name: 'eventReturnMaterial',
      component: EventReturn,
      meta: {
        resource: 'events',
        title: 'page-event-return.title',
        readableName: 'page-event-return.title',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/users',
      name: 'users',
      component: Users,
      meta: {
        resource: 'users',
        title: 'page-users.title',
        readableName: 'page-users.title',
        requiresAuth: true,
        requiresGroups: ['admin'],
      },
    },
    {
      path: '/users/new',
      name: 'addUser',
      component: User,
      meta: {
        resource: 'users',
        title: 'page-users.add',
        readableName: 'page-users.add',
        requiresAuth: true,
        requiresGroups: ['admin'],
      },
    },
    {
      path: '/users/:id',
      name: 'editUser',
      component: User,
      meta: {
        resource: 'users',
        title: 'page-users.edit-title',
        readableName: 'page-users.edit',
        requiresAuth: true,
        requiresGroups: ['admin'],
      },
    },
    {
      path: '/beneficiaries',
      name: 'beneficiaries',
      component: Beneficiaries,
      meta: {
        resource: 'persons',
        title: 'page-beneficiaries.title',
        readableName: 'page-beneficiaries.title',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/beneficiaries/new',
      name: 'addBeneficiary',
      component: Beneficiary,
      meta: {
        resource: 'persons',
        title: 'page-beneficiaries.add',
        readableName: 'page-beneficiaries.add',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/beneficiaries/:id',
      name: 'editBeneficiary',
      component: Beneficiary,
      meta: {
        resource: 'persons',
        title: 'page-beneficiaries.edit-title',
        readableName: 'page-beneficiaries.edit',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/companies/new',
      name: 'addCompany',
      component: Company,
      meta: {
        resource: 'companies',
        title: 'page-companies.add',
        readableName: 'page-companies.add',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/companies/:id',
      name: 'editCompany',
      component: Company,
      meta: {
        resource: 'companies',
        title: 'page-companies.edit-title',
        readableName: 'page-companies.edit',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/materials/:materialId/units/new',
      name: 'addMaterialUnit',
      component: MaterialUnit,
      meta: {
        readableName: 'page-material-units.add',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/materials/:materialId/units/:id',
      name: 'editMaterialUnit',
      component: MaterialUnit,
      meta: {
        readableName: 'page-material-units.edit',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/materials',
      name: 'materials',
      component: Materials,
      meta: {
        resource: 'materials',
        title: 'page-materials.title',
        readableName: 'page-materials.title',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/materials/new',
      name: 'addMaterial',
      component: Material,
      meta: {
        resource: 'materials',
        title: 'page-materials.add',
        readableName: 'page-materials.add',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/materials/:id',
      name: 'editMaterial',
      component: Material,
      meta: {
        resource: 'materials',
        title: 'page-materials.edit',
        readableName: 'page-materials.edit',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/materials/:id/view',
      name: 'viewMaterial',
      component: MaterialView,
      meta: {
        resource: 'materials',
        title: 'page-materials-view.title',
        readableName: 'page-materials.view',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/attributes',
      name: 'attributes',
      component: Attributes,
      meta: {
        resource: 'attributes',
        title: 'page-attributes.title',
        readableName: 'page-attributes.title',
        requiresAuth: true,
        requiresGroups: ['admin'],
      },
    },
    {
      path: '/categories',
      name: 'categories',
      component: Categories,
      meta: {
        resource: 'categories',
        title: 'page-categories.title',
        readableName: 'page-categories.title',
        requiresAuth: true,
        requiresGroups: ['admin'],
      },
    },
    {
      path: '/technicians',
      name: 'technicians',
      component: Technicians,
      meta: {
        resource: 'persons',
        title: 'page-technicians.title',
        readableName: 'page-technicians.title',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/technicians/new',
      name: 'addTechnician',
      component: Technician,
      meta: {
        resource: 'persons',
        title: 'page-technicians.add',
        readableName: 'page-technicians.add',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/technicians/:id',
      name: 'editTechnician',
      component: Technician,
      meta: {
        resource: 'persons',
        title: 'page-technicians.edit-title',
        readableName: 'page-technicians.edit',
        requiresAuth: true,
        requiresGroups: ['admin', 'member'],
      },
    },
    {
      path: '/tags',
      name: 'tags',
      component: Tags,
      meta: {
        resource: 'tags',
        title: 'page-tags.title',
        readableName: 'page-tags.title',
        requiresAuth: true,
        requiresGroups: ['admin'],
      },
    },
    {
      path: '/parks',
      name: 'parks',
      component: Parks,
      meta: {
        resource: 'parks',
        title: 'page-parks.title',
        readableName: 'page-parks.title',
        requiresAuth: true,
        requiresGroups: ['admin'],
      },
    },
    {
      path: '/parks/new',
      name: 'addPark',
      component: Park,
      meta: {
        resource: 'parks',
        title: 'page-parks.add',
        readableName: 'page-parks.add',
        requiresAuth: true,
        requiresGroups: ['admin'],
      },
    },
    {
      path: '/parks/:id',
      name: 'editPark',
      component: Park,
      meta: {
        resource: 'parks',
        title: 'page-parks.edit-title',
        readableName: 'page-parks.edit',
        requiresAuth: true,
        requiresGroups: ['admin'],
      },
    },
    { path: '*', redirect: '/' },
  ],
});

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
    const translatedName = Vue.i18n.translate(title);
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
    window.localStorage.removeItem('lastVisited');
    store.dispatch('auth/logout').then(() => {
      next({ path: '/login', hash: 'restricted' });
    });
    return;
  }

  next();
});

router.afterEach(({ name, fullPath, matched }) => {
  if (name === 'login') {
    return;
  }

  window.localStorage.setItem('lastVisited', fullPath);

  const { readableName } = matched[0].meta;
  store.commit('setPageTitle', readableName);
});

export default router;
