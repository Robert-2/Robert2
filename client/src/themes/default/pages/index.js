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
import { Group } from '@/stores/api/groups';

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
    // - Calendrier
    //

    {
        name: 'calendar',
        path: '/',
        component: Calendar,
        meta: {
            requiresAuth: true,
            requiresGroups: [
                Group.ADMIN,
                Group.MEMBER,
                Group.VISITOR,
            ],
        },
    },

    //
    // - Événements
    //

    {
        name: 'add-event',
        path: '/events/new',
        component: Event,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'event-return-inventory',
        path: '/events/:id(\\d+)/return-inventory',
        component: EventReturn,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'edit-event',
        path: '/events/:id',
        component: Event,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
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
            requiresGroups: [Group.ADMIN],
        },
    },
    {
        name: 'add-user',
        path: '/users/new',
        component: User,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN],
        },
    },
    {
        name: 'edit-user',
        path: '/users/:id(\\d+)',
        component: User,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN],
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
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'add-beneficiary',
        path: '/beneficiaries/new',
        component: Beneficiary,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'edit-beneficiary',
        path: '/beneficiaries/:id(\\d+)',
        component: Beneficiary,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
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
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'edit-company',
        path: '/companies/:id(\\d+)',
        component: Company,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
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
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'add-material',
        path: '/materials/new',
        component: Material,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'edit-material',
        path: '/materials/:id(\\d+)',
        component: Material,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'view-material',
        path: '/materials/:id(\\d+)/view',
        component: MaterialView,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
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
            requiresGroups: [Group.ADMIN],
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
            requiresAuth: true,
            requiresGroups: [Group.ADMIN],
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
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'add-technician',
        path: '/technicians/new',
        component: Technician,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'edit-technician',
        path: '/technicians/:id(\\d+)',
        component: Technician,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'view-technician',
        path: '/technicians/:id(\\d+)/view',
        component: TechnicianView,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
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
            requiresGroups: [Group.ADMIN],
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
            requiresAuth: true,
            requiresGroups: [Group.ADMIN],
        },
    },
    {
        name: 'add-park',
        path: '/parks/new',
        component: Park,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN],
        },
    },
    {
        name: 'edit-park',
        path: '/parks/:id(\\d+)',
        component: Park,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN],
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
            requiresGroups: [
                Group.ADMIN,
                Group.MEMBER,
                Group.VISITOR,
            ],
        },
    },
    {
        name: 'global-settings',
        path: '/settings',
        component: GlobalSettings,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN],
        },
    },

    //
    // - Catch all.
    //

    { path: '*', redirect: '/' },
];
