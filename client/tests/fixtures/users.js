import omit from 'lodash/omit';
import pick from 'lodash/pick';
import { Group } from '@/stores/api/groups';
import { dataFactory } from './@utils';

const data = [
    {
        id: 1,
        pseudo: 'test1',
        first_name: 'Jean',
        last_name: 'Fountain',
        full_name: 'Jean Fountain',
        phone: null,
        email: 'tester@robertmanager.net',
        group: Group.ADMIN,
        language: 'en',
        default_bookings_view: 'calendar',
    },
    {
        id: 2,
        pseudo: 'test2',
        first_name: 'Roger',
        last_name: 'Rabbit',
        full_name: 'Roger Rabbit',
        phone: null,
        email: 'tester2@robertmanager.net',
        group: Group.MEMBER,
        language: 'fr',
        default_bookings_view: 'calendar',
    },
    {
        id: 3,
        pseudo: 'nobody',
        first_name: null,
        last_name: null,
        full_name: null,
        phone: null,
        email: 'nobody@robertmanager.net',
        group: Group.MEMBER,
        language: 'fr',
        default_bookings_view: 'listing',
    },
    {
        id: 4,
        pseudo: 'TheVisitor',
        first_name: 'Henry',
        last_name: 'Berluc',
        full_name: 'Henry Berluc',
        phone: '+33724000000',
        email: 'visitor@robertmanager.net',
        group: Group.VISITOR,
        language: 'fr',
        default_bookings_view: 'calendar',
    },
    {
        id: 5,
        pseudo: 'caroline',
        first_name: 'Caroline',
        last_name: 'Farol',
        full_name: 'Caroline Farol',
        phone: '+33786325500',
        email: 'external@robertmanager.net',
        group: Group.VISITOR,
        language: 'en',
        default_bookings_view: 'calendar',
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data, (user) => (
    omit(user, [
        'language',
        'default_bookings_view',
    ])
));

/** @type {import('./@utils').FactoryReturnType} */
const asDetails = dataFactory(data, (user) => (
    omit(user, [
        'language',
        'default_bookings_view',
    ])
));

/** @type {import('./@utils').FactoryReturnType} */
const asSession = dataFactory(data);

/** @type {import('./@utils').FactoryReturnType} */
const settings = dataFactory(data, (user) => (
    pick(user, ['language', 'default_bookings_view'])
));

export default {
    default: asDefault,
    details: asDetails,
    session: asSession,
    settings,
};
