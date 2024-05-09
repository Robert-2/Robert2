import { dataFactory } from './@utils';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import technicians from './technicians';
import beneficiaries from './beneficiaries';
import materials from './materials';
import estimates from './estimates';
import invoices from './invoices';
import users from './users';
import { BookingEntity } from '@/stores/api/bookings';

const data = [
    {
        id: 1,
        reference: null,
        title: `Premier événement`,
        description: null,
        location: `Gap`,
        preparer: null,
        color: null,
        mobilization_period: {
            start: '2018-12-16 15:45:00',
            end: '2018-12-19 00:00:00',
            isFullDays: false,
        },
        operation_period: {
            start: '2018-12-17 10:00:00',
            end: '2018-12-18 18:00:00',
            isFullDays: false,
        },
        degressive_rate: '1.75',
        discount_rate: '0',
        vat_rate: '20.00',
        currency: 'EUR',
        daily_total: '341.45',
        total_without_discount: '597.54',
        total_discountable: '72.54',
        total_discount: '0.00',
        total_without_taxes: '597.54',
        total_taxes: '119.51',
        total_with_taxes: '717.05',
        total_replacement: '19808.90',
        is_confirmed: false,
        is_archived: false,
        is_billable: true,
        is_departure_inventory_done: true,
        departure_inventory_datetime: '2018-12-16 15:35:00',
        departure_inventory_author: users.default(1),
        is_return_inventory_started: true,
        is_return_inventory_done: true,
        return_inventory_datetime: null,
        return_inventory_author: null,
        has_missing_materials: null,
        has_not_returned_materials: false,
        categories: [1, 2],
        parks: [1],
        technicians: [
            {
                id: 1,
                event_id: 1,
                technician_id: 1,
                period: {
                    start: '2018-12-17 09:00:00',
                    end: '2018-12-18 22:00:00',
                    isFullDays: false,
                },
                position: 'Régisseur',
                technician: () => technicians.default(1),
            },
            {
                id: 2,
                event_id: 1,
                technician_id: 2,
                period: {
                    start: '2018-12-18 14:00:00',
                    end: '2018-12-18 18:00:00',
                    isFullDays: false,
                },
                position: 'Technicien plateau',
                technician: () => technicians.default(2),
            },
        ],
        beneficiaries: [
            beneficiaries.default(1),
        ],
        materials: [
            Object.assign(materials.default(1), {
                pivot: {
                    quantity: 1,
                    quantity_departed: 1,
                    quantity_returned: 1,
                    quantity_returned_broken: 0,
                    departure_comment: null,
                },
            }),
            Object.assign(materials.default(2), {
                pivot: {
                    quantity: 1,
                    quantity_departed: 1,
                    quantity_returned: 1,
                    quantity_returned_broken: 0,
                    departure_comment: `Le matériel n'est pas en très bon état.`,
                },
            }),
            Object.assign(materials.default(4), {
                pivot: {
                    quantity: 1,
                    quantity_departed: 1,
                    quantity_returned: 1,
                    quantity_returned_broken: 1,
                    departure_comment: null,
                },
            }),
        ],
        invoices: [
            invoices.default(1),
        ],
        estimates: [
            estimates.default(1),
        ],
        note: null,
        author: users.default(1),
        created_at: '2018-12-01 12:50:45',
        updated_at: '2018-12-05 08:31:21',
    },
    {
        id: 2,
        reference: null,
        title: 'Second événement',
        description: null,
        location: 'Lyon',
        preparer: null,
        color: '#ffba49',
        mobilization_period: {
            start: '2018-12-18 00:00:00',
            end: '2018-12-20 00:00:00',
            isFullDays: false,
        },
        operation_period: {
            start: '2018-12-18',
            end: '2018-12-19',
            isFullDays: true,
        },
        degressive_rate: '1.75',
        discount_rate: '0',
        vat_rate: '20.00',
        currency: 'EUR',
        daily_total: '951.00',
        total_without_discount: '1664.25',
        total_discountable: '89.25',
        total_discount: '0.00',
        total_without_taxes: '1664.25',
        total_taxes: '332.85',
        total_with_taxes: '1997.10',
        total_replacement: '58899.80',
        is_archived: false,
        is_billable: true,
        is_confirmed: false,
        has_missing_materials: null,
        has_not_returned_materials: true,
        is_departure_inventory_done: false,
        departure_inventory_datetime: null,
        departure_inventory_author: null,
        is_return_inventory_started: true,
        is_return_inventory_done: true,
        return_inventory_datetime: '2018-12-20 14:30:00',
        return_inventory_author: users.default(2),
        categories: [1],
        parks: [1],
        materials: [
            Object.assign(materials.default(1), {
                pivot: {
                    quantity: 3,
                    quantity_departed: 2,
                    quantity_returned: 2,
                    quantity_returned_broken: 0,
                    departure_comment: null,
                },
            }),
            Object.assign(materials.default(2), {
                pivot: {
                    quantity: 2,
                    quantity_departed: 2,
                    quantity_returned: 2,
                    quantity_returned_broken: 0,
                    departure_comment: `Validé avec le client.`,
                },
            }),
        ],
        beneficiaries: [
            beneficiaries.default(3),
        ],
        technicians: [],
        estimates: [],
        invoices: [],
        note: `Il faudra envoyer le matériel sur Lyon avant l'avant-veille.`,
        author: users.default(1),
        created_at: '2018-12-16 12:50:45',
        updated_at: null,
    },
    {
        id: 3,
        reference: null,
        title: 'Avant-premier événement',
        description: null,
        location: 'Brousse',
        preparer: null,
        color: null,
        mobilization_period: {
            start: '2018-12-15 08:30:00',
            end: '2018-12-16 15:45:00',
            isFullDays: false,
        },
        operation_period: {
            start: '2018-12-15 09:00:00',
            end: '2018-12-17 00:00:00',
            isFullDays: false,
        },
        currency: 'EUR',
        total_replacement: '1353.90',
        has_missing_materials: null,
        has_not_returned_materials: null,
        is_archived: true,
        is_billable: false,
        is_confirmed: false,
        is_departure_inventory_done: true,
        departure_inventory_datetime: '2018-12-15 08:17:00',
        departure_inventory_author: users.default(1),
        is_return_inventory_started: true,
        is_return_inventory_done: true,
        return_inventory_datetime: '2018-12-16 15:42:00',
        return_inventory_author: users.default(1),
        categories: [1, 2],
        parks: [1],
        materials: [
            Object.assign(materials.default(3), {
                pivot: {
                    quantity: 10,
                    quantity_departed: 10,
                    quantity_returned: 0,
                    quantity_returned_broken: 0,
                    departure_comment: null,
                },
            }),
            Object.assign(materials.default(2), {
                pivot: {
                    quantity: 1,
                    quantity_departed: 1,
                    quantity_returned: 0,
                    quantity_returned_broken: 0,
                    departure_comment: null,
                },
            }),
            Object.assign(materials.default(5), {
                pivot: {
                    quantity: 12,
                    quantity_departed: 12,
                    quantity_returned: 0,
                    quantity_returned_broken: 0,
                    departure_comment: null,
                },
            }),
        ],
        beneficiaries: [],
        technicians: [],
        author: users.default(1),
        note: null,
        created_at: '2018-12-14 12:20:00',
        updated_at: '2018-12-14 12:30:00',
    },
    {
        id: 4,
        reference: null,
        title: 'Concert X',
        description: null,
        location: 'Moon',
        preparer: () => technicians.default(2),
        color: '#ef5b5b',
        mobilization_period: {
            start: '2019-03-01 00:00:00',
            end: '2019-04-11 00:00:00',
            isFullDays: false,
        },
        operation_period: {
            start: '2019-03-01',
            end: '2019-04-10',
            isFullDays: true,
        },
        currency: 'EUR',
        total_replacement: '116238.00',
        is_archived: false,
        is_billable: false,
        is_confirmed: false,
        is_departure_inventory_done: false,
        departure_inventory_datetime: null,
        departure_inventory_author: null,
        is_return_inventory_started: true,
        is_return_inventory_done: false,
        return_inventory_datetime: null,
        return_inventory_author: null,
        has_missing_materials: true,
        has_not_returned_materials: null,
        categories: [1, 3],
        parks: [1, 2],
        materials: [
            Object.assign(materials.default(1), {
                pivot: {
                    quantity: 1,
                    quantity_departed: null,
                    quantity_returned: 0,
                    quantity_returned_broken: 0,
                    departure_comment: null,
                },
            }),
            Object.assign(materials.default(6), {
                pivot: {
                    quantity: 2,
                    quantity_departed: 1,
                    quantity_returned: 1,
                    quantity_returned_broken: 0,
                    departure_comment: null,
                },
            }),
            Object.assign(materials.default(7), {
                pivot: {
                    quantity: 3,
                    quantity_departed: null,
                    quantity_returned: 0,
                    quantity_returned_broken: 0,
                    departure_comment: null,
                },
            }),
        ],
        beneficiaries: [],
        technicians: [],
        note: `Penser à contacter Cap Canaveral fin janvier pour booker le pas de tir.`,
        author: users.default(1),
        created_at: '2019-01-01 20:12:00',
        updated_at: null,
    },
    {
        id: 5,
        reference: null,
        title: `Kermesse de l'école des trois cailloux`,
        description: null,
        location: 'Saint-Jean-la-Forêt',
        preparer: null,
        color: null,
        mobilization_period: {
            start: '2020-01-01 00:00:00',
            end: '2020-01-02 00:00:00',
            isFullDays: false,
        },
        operation_period: {
            start: '2020-01-01',
            end: '2020-01-01',
            isFullDays: true,
        },
        currency: 'EUR',
        total_replacement: '17000.00',
        is_archived: false,
        is_billable: false,
        is_confirmed: false,
        is_departure_inventory_done: false,
        departure_inventory_datetime: null,
        departure_inventory_author: null,
        is_return_inventory_started: false,
        is_return_inventory_done: false,
        return_inventory_datetime: null,
        return_inventory_author: null,
        has_missing_materials: true,
        has_not_returned_materials: null,
        categories: [4],
        parks: [1],
        materials: [
            Object.assign(materials.default(8), {
                pivot: {
                    quantity: 2,
                    quantity_departed: 1,
                    quantity_returned: null,
                    quantity_returned_broken: null,
                    departure_comment: null,
                },
            }),
        ],
        beneficiaries: [
            beneficiaries.default(1),
        ],
        technicians: [],
        note: null,
        author: users.default(1),
        created_at: '2019-12-25 14:59:40',
        updated_at: null,
    },
    {
        id: 6,
        reference: null,
        title: 'Un événement sans inspiration',
        description: null,
        location: 'La Clusaz',
        preparer: null,
        color: '#ef5b5b',
        mobilization_period: {
            start: '2019-03-15 00:00:00',
            end: '2019-04-02 00:00:00',
            isFullDays: false,
        },
        operation_period: {
            start: '2019-03-15',
            end: '2019-04-01',
            isFullDays: true,
        },
        currency: 'EUR',
        total_replacement: '0.00',
        is_archived: false,
        is_billable: false,
        is_confirmed: false,
        is_departure_inventory_done: false,
        departure_inventory_datetime: null,
        departure_inventory_author: null,
        is_return_inventory_started: false,
        is_return_inventory_done: false,
        return_inventory_datetime: null,
        return_inventory_author: null,
        has_missing_materials: false,
        has_not_returned_materials: null,
        categories: [],
        parks: [],
        materials: [],
        beneficiaries: [],
        technicians: [],
        note: null,
        author: users.default(1),
        created_at: '2019-02-01 12:00:00',
        updated_at: '2019-02-01 12:05:00',
    },
    {
        id: 7,
        reference: null,
        title: 'Médiévales de Machin-le-chateau 2023',
        description: null,
        location: 'Machin-le-chateau',
        preparer: () => technicians.default(2),
        color: null,
        mobilization_period: {
            start: '2023-05-25 00:00:00',
            end: '2023-05-29 00:00:00',
            isFullDays: false,
        },
        operation_period: {
            start: '2023-05-25',
            end: '2023-05-28',
            isFullDays: true,
        },
        degressive_rate: '3.25',
        discount_rate: '0',
        vat_rate: '20.00',
        currency: 'EUR',
        daily_total: '1031.88',
        total_without_discount: '3353.61',
        total_discountable: '103.68',
        total_discount: '0.00',
        total_without_taxes: '3353.61',
        total_taxes: '670.72',
        total_with_taxes: '4024.33',
        total_replacement: '71756.00',
        is_archived: false,
        is_billable: true,
        is_confirmed: true,
        is_departure_inventory_done: false,
        departure_inventory_datetime: null,
        departure_inventory_author: null,
        is_return_inventory_started: true,
        is_return_inventory_done: false,
        return_inventory_datetime: null,
        return_inventory_author: null,
        has_missing_materials: false,
        has_not_returned_materials: null,
        categories: [1, 2, 3],
        parks: [1, 2],
        materials: [
            Object.assign(materials.default(1), {
                pivot: {
                    quantity: 2,
                    quantity_departed: null,
                    quantity_returned: 1,
                    quantity_returned_broken: 0,
                    departure_comment: null,
                },
            }),
            Object.assign(materials.default(6), {
                pivot: {
                    quantity: 2,
                    quantity_departed: null,
                    quantity_returned: 2,
                    quantity_returned_broken: 1,
                    departure_comment: null,
                },
            }),
            Object.assign(materials.default(7), {
                pivot: {
                    quantity: 1,
                    quantity_departed: null,
                    quantity_returned: null,
                    quantity_returned_broken: null,
                    departure_comment: null,
                },
            }),
            Object.assign(materials.default(4), {
                pivot: {
                    quantity: 2,
                    quantity_departed: null,
                    quantity_returned: 1,
                    quantity_returned_broken: 1,
                    departure_comment: null,
                },
            }),
        ],
        beneficiaries: [],
        technicians: [
            {
                id: 3,
                event_id: 7,
                technician_id: 2,
                position: 'Ingénieur du son',
                period: {
                    start: '2023-05-25 00:00:00',
                    end: '2023-05-29 00:00:00',
                    isFullDays: false,
                },
                technician: () => technicians.default(2),
            },
        ],
        invoices: [],
        estimates: [],
        note: null,
        author: users.default(1),
        created_at: '2022-05-29 18:00:00',
        updated_at: '2022-05-29 18:05:00',
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asSummary = dataFactory(data, (event) => (
    pick(event, [
        'id',
        'title',
        'mobilization_period',
        'operation_period',
        'location',
    ])
));

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data, (event) => (
    pick(event, [
        'id',
        'title',
        'reference',
        'description',
        'mobilization_period',
        'operation_period',
        'color',
        'location',
        'is_confirmed',
        'is_billable',
        'is_archived',
        'is_departure_inventory_done',
        'is_return_inventory_done',
        'note',
        'created_at',
        'updated_at',
    ])
));

/** @type {import('./@utils').FactoryReturnType} */
const asDetails = dataFactory(data, (event) => ({
    ...omit(event, ['parks', 'categories']),
    preparer: event.preparer?.() ?? null,
    technicians: event.technicians.map((technician) => (
        { ...technician, technician: technician.technician() }
    )),
}));

/** @type {import('./@utils').FactoryReturnType} */
const asBookingExcerpt = dataFactory(data, (event) => ({
    ...pick(event, [
        'id',
        'title',
        'location',
        'color',
        'mobilization_period',
        'operation_period',
        'beneficiaries',
        'technicians',
        'is_confirmed',
        'is_archived',
        'is_departure_inventory_done',
        'is_return_inventory_done',
        'has_not_returned_materials',
        'categories',
        'parks',
        'created_at',
    ]),
    entity: BookingEntity.EVENT,
    technicians: event.technicians.map((technician) => (
        { ...technician, technician: technician.technician() }
    )),
}));

/** @type {import('./@utils').FactoryReturnType} */
const asBookingSummary = dataFactory(data, (event) => ({
    ...pick(event, [
        'id',
        'title',
        'reference',
        'description',
        'location',
        'color',
        'mobilization_period',
        'operation_period',
        'beneficiaries',
        'technicians',
        'is_confirmed',
        'is_billable',
        'is_archived',
        'is_departure_inventory_done',
        'is_return_inventory_done',
        'has_not_returned_materials',
        'has_missing_materials',
        'categories',
        'parks',
        'created_at',
    ]),
    entity: BookingEntity.EVENT,
    technicians: event.technicians.map((technician) => (
        { ...technician, technician: technician.technician() }
    )),
}));

/** @type {import('./@utils').FactoryReturnType} */
const asBookingDefault = dataFactory(data, (event) => ({
    ...omit(event, ['parks', 'categories']),
    entity: BookingEntity.EVENT,
    preparer: event.preparer?.() ?? null,
    technicians: event.technicians.map((technician) => (
        { ...technician, technician: technician.technician() }
    )),
}));

export default {
    summary: asSummary,
    default: asDefault,
    details: asDetails,

    // - Booking.
    booking: {
        excerpt: asBookingExcerpt,
        summary: asBookingSummary,
        default: asBookingDefault,
    },
};
