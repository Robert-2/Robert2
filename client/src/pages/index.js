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
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {
            layout: 'minimalist',
            requiresAuth: false,
        },
    },
    {
        path: '/user-settings',
        name: 'user-settings',
        component: UserSettings,
        meta: {
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
            title: 'page-events.edit',
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
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        path: '/users',
        name: 'users',
        component: Users,
        meta: {
            title: 'page-users.title',
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
            title: 'page-users.edit',
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },
    {
        path: '/beneficiaries',
        name: 'beneficiaries',
        component: Beneficiaries,
        meta: {
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
            title: 'page-beneficiaries.edit',
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
            title: 'page-companies.edit',
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
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },
    {
        path: '/technicians',
        name: 'technicians',
        component: Technicians,
        meta: {
            title: 'page-technicians.title',
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
            title: 'page-technicians.edit',
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        path: '/technicians/:id/view',
        name: 'viewTechnician',
        component: TechnicianView,
        meta: {
            resource: 'persons',
            title: 'technician',
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
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },
    {
        path: '/parks',
        name: 'parks',
        component: Parks,
        meta: {
            title: 'page-parks.title',
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },
    {
        path: '/parks/new',
        name: 'addPark',
        component: Park,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },
    {
        path: '/parks/:id',
        name: 'editPark',
        component: Park,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },
    {
        path: '/settings',
        name: 'settings',
        component: GlobalSettings,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },
    { path: '*', redirect: '/' },
];
