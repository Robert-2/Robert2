import Login from './Login';
import Calendar from './Calendar';
import Event from './Event';
import EventReturn from './EventReturn';
import Users from './Users';
import User from './User';
import Beneficiaries from './Beneficiaries';
import Beneficiary from './Beneficiary';
import Company from './Company';
import Materials from './Materials';
import Material from './Material';
import MaterialView from './MaterialView';
import Attributes from './Attributes';
import Tags from './Tags';
import Technicians from './Technicians';
import Technician from './Technician';
import TechnicianView from './TechnicianView';
import Categories from './Categories';
import Parks from './Parks';
import Park from './Park';
import UserSettings from './Settings/User';
import GlobalSettings from './Settings/Global';

export default [
    //
    // - Authentification
    //

    {
        name: 'login',
        path: '/login',
        component: Login,
        meta: {
            layout: 'minimalist',
            requiresAuth: false,
        },
    },

    //
    // - Événements
    //

    {
        name: 'events',
        path: '/',
        component: Calendar,
        meta: {
            resource: 'events',
            title: 'page-calendar.title',
            requiresAuth: true,
            requiresGroups: ['admin', 'member', 'visitor'],
        },
    },
    {
        name: 'add-event',
        path: '/events/new',
        component: Event,
        meta: {
            resource: 'events',
            title: 'page-events.add',
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        name: 'edit-event',
        path: '/events/:id',
        component: Event,
        meta: {
            resource: 'events',
            title: 'page-events.edit',
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        name: 'event-return-material',
        path: '/event-return/:id',
        component: EventReturn,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },

    //
    // - Utilisateurs
    //

    {
        name: 'users',
        path: '/users',
        component: Users,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },
    {
        name: 'add-user',
        path: '/users/new',
        component: User,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },
    {
        name: 'edit-user',
        path: '/users/:id',
        component: User,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },

    //
    // - Emprunteurs
    //

    {
        name: 'beneficiaries',
        path: '/beneficiaries',
        component: Beneficiaries,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        name: 'add-beneficiary',
        path: '/beneficiaries/new',
        component: Beneficiary,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        name: 'edit-beneficiary',
        path: '/beneficiaries/:id',
        component: Beneficiary,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },

    //
    // - Sociétés
    //

    {
        name: 'add-company',
        path: '/companies/new',
        component: Company,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        name: 'edit-company',
        path: '/companies/:id',
        component: Company,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },

    //
    // - Matériel
    //

    {
        name: 'materials',
        path: '/materials',
        component: Materials,
        meta: {
            resource: 'materials',
            title: 'page-materials.title',
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        name: 'add-material',
        path: '/materials/new',
        component: Material,
        meta: {
            resource: 'materials',
            title: 'page-materials.add',
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        name: 'edit-material',
        path: '/materials/:id',
        component: Material,
        meta: {
            resource: 'materials',
            title: 'page-materials.edit',
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        name: 'view-material',
        path: '/materials/:id/view',
        component: MaterialView,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },

    //
    // - Attributs
    //

    {
        name: 'attributes',
        path: '/attributes',
        component: Attributes,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },

    //
    // - Catégories
    //

    {
        name: 'categories',
        path: '/categories',
        component: Categories,
        meta: {
            resource: 'categories',
            title: 'page-categories.title',
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },

    //
    // - Techniciens
    //

    {
        name: 'technicians',
        path: '/technicians',
        component: Technicians,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        name: 'add-technician',
        path: '/technicians/new',
        component: Technician,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        name: 'edit-technician',
        path: '/technicians/:id',
        component: Technician,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        name: 'view-technician',
        path: '/technicians/:id/view',
        component: TechnicianView,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },

    //
    // - Tags
    //

    {
        name: 'tags',
        path: '/tags',
        component: Tags,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },

    //
    // - Parcs
    //

    {
        name: 'parks',
        path: '/parks',
        component: Parks,
        meta: {
            title: 'page-parks.title',
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },
    {
        name: 'add-park',
        path: '/parks/new',
        component: Park,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },
    {
        name: 'edit-park',
        path: '/parks/:id',
        component: Park,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },

    //
    // - Paramètres
    //

    {
        name: 'user-settings',
        path: '/user-settings',
        component: UserSettings,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member', 'visitor'],
        },
    },
    {
        name: 'global-settings',
        path: '/settings',
        component: GlobalSettings,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },

    //
    // - Catch all.
    //

    { path: '*', redirect: '/' },
];
