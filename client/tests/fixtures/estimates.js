import { dataFactory } from './@utils';

const data = [
    {
        id: 1,
        date: '2021-01-30 14:00:00',
        url: 'http://loxya.test/estimates/1/pdf',
        discount_rate: '5.0000',
        total_without_taxes: '550.28',
        total_with_taxes: '660.34',
        currency: 'EUR',
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data);

export default { default: asDefault };
