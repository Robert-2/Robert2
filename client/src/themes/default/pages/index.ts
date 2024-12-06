import Login from './Login';
import Schedule, { pages as schedulePages } from './Schedule';
import EventEdit from './EventEdit';
import EventDeparture from './EventDeparture';
import EventReturn from './EventReturn';
import Users from './Users';
import UserEdit from './UserEdit';
import Beneficiaries from './Beneficiaries';
import BeneficiaryView from './BeneficiaryView';
import BeneficiaryEdit from './BeneficiaryEdit';
import CompanyEdit from './CompanyEdit';
import Materials from './Materials';
import MaterialEdit from './MaterialEdit';
import MaterialView from './MaterialView';
import Attributes from './Attributes';
import AttributeEdit from './AttributeEdit';
import Technicians from './Technicians';
import TechnicianEdit from './TechnicianEdit';
import TechnicianView from './TechnicianView';
import Parks from './Parks';
import ParkEdit from './ParkEdit';
import UserSettings from './Settings/User';
import GlobalSettings, { pages as globalSettingsPages } from './Settings/Global';
import { Group } from '@/stores/api/groups';

import type { RouteConfig } from 'vue-router';

const pages: RouteConfig[] = [
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
    // - Accueil
    //

    {
        name: 'home',
        path: '/',
        redirect: { name: 'schedule' },
    },

    //
    // - Planning
    //

    {
        path: '/schedule',
        component: Schedule,
        meta: {
            requiresAuth: true,
            requiresGroups: [
                Group.ADMINISTRATION,
                Group.MANAGEMENT,
                Group.READONLY_PLANNING_GENERAL,
            ],
        },
        children: schedulePages,
    },

    //
    // - Événements
    //

    {
        name: 'add-event',
        path: '/events/new',
        component: EventEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },
    {
        name: 'event-departure-inventory',
        path: '/events/:id(\\d+)/departure-inventory',
        component: EventDeparture,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },
    {
        name: 'event-return-inventory',
        path: '/events/:id(\\d+)/return-inventory',
        component: EventReturn,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },
    {
        name: 'edit-event',
        path: '/events/:id(\\d+)',
        component: EventEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
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
            requiresGroups: [Group.ADMINISTRATION],
        },
    },
    {
        name: 'add-user',
        path: '/users/new',
        component: UserEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION],
        },
    },
    {
        name: 'edit-user',
        path: '/users/:id(\\d+)',
        component: UserEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION],
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
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },
    {
        name: 'view-beneficiary',
        path: '/beneficiaries/:id(\\d+)/view',
        component: BeneficiaryView,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },
    {
        name: 'add-beneficiary',
        path: '/beneficiaries/new',
        component: BeneficiaryEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },
    {
        name: 'edit-beneficiary',
        path: '/beneficiaries/:id(\\d+)',
        component: BeneficiaryEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },

    //
    // - Sociétés
    //

    {
        name: 'add-company',
        path: '/companies/new',
        component: CompanyEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },
    {
        name: 'edit-company',
        path: '/companies/:id(\\d+)',
        component: CompanyEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
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
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },
    {
        name: 'add-material',
        path: '/materials/new',
        component: MaterialEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },
    {
        name: 'edit-material',
        path: '/materials/:id(\\d+)',
        component: MaterialEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },
    {
        name: 'view-material',
        path: '/materials/:id(\\d+)/view',
        component: MaterialView,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
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
            requiresGroups: [Group.ADMINISTRATION],
        },
    },
    {
        name: 'add-attribute',
        path: '/attributes/new',
        component: AttributeEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION],
        },
    },
    {
        name: 'edit-attribute',
        path: '/attributes/:id(\\d+)',
        component: AttributeEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION],
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
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },
    {
        name: 'add-technician',
        path: '/technicians/new',
        component: TechnicianEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },
    {
        name: 'edit-technician',
        path: '/technicians/:id(\\d+)',
        component: TechnicianEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
        },
    },
    {
        name: 'view-technician',
        path: '/technicians/:id(\\d+)/view',
        component: TechnicianView,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION, Group.MANAGEMENT],
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
            requiresGroups: [Group.ADMINISTRATION],
        },
    },
    {
        name: 'add-park',
        path: '/parks/new',
        component: ParkEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION],
        },
    },
    {
        name: 'edit-park',
        path: '/parks/:id(\\d+)',
        component: ParkEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION],
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
                Group.ADMINISTRATION,
                Group.MANAGEMENT,
                Group.READONLY_PLANNING_GENERAL,
            ],
        },
    },
    {
        path: '/settings',
        component: GlobalSettings,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMINISTRATION],
        },
        children: globalSettingsPages,
    },

    //
    // - Catch all.
    //

    { path: '*', redirect: '/' },
];

export default pages;
