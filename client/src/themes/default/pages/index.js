import Login from './Login';
import Calendar from './Calendar';
import Event from './Event';
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
import Tags from './Tags';
import Technicians from './Technicians';
import TechnicianEdit from './TechnicianEdit';
import TechnicianView from './TechnicianView';
import Categories from './Categories';
import Parks from './Parks';
import ParkEdit from './ParkEdit';
import UserSettings from './Settings/User';
import GlobalSettings, { pages as globalSettingsPages } from './Settings/Global';
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
        name: 'event-departure-inventory',
        path: '/events/:id(\\d+)/departure-inventory',
        component: EventDeparture,
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
        component: UserEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN],
        },
    },
    {
        name: 'edit-user',
        path: '/users/:id(\\d+)',
        component: UserEdit,
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
        name: 'view-beneficiary',
        path: '/beneficiaries/:id(\\d+)/view',
        component: BeneficiaryView,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'add-beneficiary',
        path: '/beneficiaries/new',
        component: BeneficiaryEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'edit-beneficiary',
        path: '/beneficiaries/:id(\\d+)',
        component: BeneficiaryEdit,
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
        component: CompanyEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'edit-company',
        path: '/companies/:id(\\d+)',
        component: CompanyEdit,
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
        component: MaterialEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'edit-material',
        path: '/materials/:id(\\d+)',
        component: MaterialEdit,
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
    {
        name: 'add-attribute',
        path: '/attributes/new',
        component: AttributeEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN],
        },
    },
    {
        name: 'edit-attribute',
        path: '/attributes/:id(\\d+)',
        component: AttributeEdit,
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
        component: TechnicianEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN, Group.MEMBER],
        },
    },
    {
        name: 'edit-technician',
        path: '/technicians/:id(\\d+)',
        component: TechnicianEdit,
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
        component: ParkEdit,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN],
        },
    },
    {
        name: 'edit-park',
        path: '/parks/:id(\\d+)',
        component: ParkEdit,
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
        path: '/settings',
        component: GlobalSettings,
        meta: {
            requiresAuth: true,
            requiresGroups: [Group.ADMIN],
        },
        children: globalSettingsPages,
    },

    //
    // - Catch all.
    //

    { path: '*', redirect: '/' },
];
