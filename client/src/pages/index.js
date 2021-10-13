import Login from './Login';
import UserProfile from './UserProfile';
import UserSettings from './UserSettings';
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
import MaterialUnit from './MaterialUnit';
import MaterialView from './MaterialView';
import Attributes from './Attributes';
import Tags from './Tags';
import Technicians from './Technicians';
import Technician from './Technician';
import TechnicianView from './TechnicianView';
import Categories from './Categories';
import Parks from './Parks';
import Park from './Park';
import Settings from './Settings';
import Inventories from './Inventories';
import Inventory from './Inventory';
import ListTemplates from './ListTemplates';
import ListTemplate from './ListTemplate';

export default [
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {
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
            requiresAuth: true,
            requiresGroups: ['admin', 'member', 'visitor'],
        },
    },
    {
        path: '/user-settings',
        name: 'user-settings',
        component: UserSettings,
        meta: {
            resource: 'users',
            title: 'page-user-settings.title',
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
            resource: 'users',
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
            resource: 'persons',
            title: 'page-beneficiaries.title',
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
        path: '/materials/:materialId/units/new',
        name: 'addMaterialUnit',
        component: MaterialUnit,
        meta: {
            title: 'page-material-units.add',
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        path: '/materials/:materialId/units/:id',
        name: 'editMaterialUnit',
        component: MaterialUnit,
        meta: {
            title: 'page-material-units.edit',
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
            resource: 'persons',
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
        path: '/inventories',
        name: 'inventories',
        component: Inventories,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        path: '/parks',
        name: 'parks',
        component: Parks,
        meta: {
            resource: 'parks',
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
            resource: 'parks',
            title: 'page-parks.add',
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
            title: 'page-parks.edit',
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },
    {
        path: '/parks/:parkId(\\d+)/inventories',
        name: 'park-inventories',
        component: Inventories,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        path: '/parks/:parkId(\\d+)/inventories/new',
        name: 'park-inventories-new',
        component: Inventory,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        path: '/list-templates',
        name: 'list-templates',
        component: ListTemplates,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        path: '/list-templates/new',
        name: 'new-list-template',
        component: ListTemplate,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        path: '/list-templates/:id(\\d+)',
        name: 'edit-list-template',
        component: ListTemplate,
        meta: {
            requiresAuth: true,
            requiresGroups: ['admin', 'member'],
        },
    },
    {
        path: '/settings',
        name: 'settings',
        component: Settings,
        meta: {
            resource: 'settings',
            title: 'page-settings.title',
            requiresAuth: true,
            requiresGroups: ['admin'],
        },
    },
    { path: '*', redirect: '/' },
];
