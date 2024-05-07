import { dataFactory } from './@utils';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

const data = [
    {
        id: 1,
        name: 'default',
        street: 'Hangar 951',
        postal_code: '01234',
        locality: 'Secretville',
        country_id: 1,
        opening_hours: `Du lundi au vendredi, de 09:00 à 19:00.`,
        note: null,
        total_items: 7,
        total_stock_quantity: 87,
        has_ongoing_booking: false,
    },
    {
        id: 2,
        name: 'spare',
        street: null,
        postal_code: null,
        locality: null,
        country_id: null,
        opening_hours: null,
        note: `Les bidouilles de fond de tiroir`,
        total_items: 2,
        total_stock_quantity: 3,
        has_ongoing_booking: false,
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asSummary = dataFactory(data, (park) => (
    pick(park, ['id', 'name'])
));

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data, (park) => (
    omit(park, [
        'has_ongoing_booking',
    ])
));

/** @type {import('./@utils').FactoryReturnType} */
const asDetails = dataFactory(data);

export default {
    default: asDefault,
    details: asDetails,
    summary: asSummary,
};
