import { dataFactory } from './@utils';

const data = [
    {
        id: 1,
        date: '2021-01-30 14:00:00',
        url: 'http://loxya.test/estimates/1/pdf',
        total_without_taxes: '886.64',
        total_taxes: [
            {
                name: 'T.V.A.',
                is_rate: true,
                value: '20.000',
                total: '176.42',
            },
            {
                name: 'T.V.A.',
                is_rate: true,
                value: '5.000',
                total: '0.23',
            },
        ],
        total_with_taxes: '1063.29',
        currency: 'EUR',
    },
    {
        id: 2,
        date: '2021-01-30 14:00:00',
        url: 'http://loxya.test/estimates/2/pdf',
        total_without_taxes: '550.28',
        total_taxes: [
            {
                name: 'T.V.A.',
                is_rate: true,
                value: '20.000',
                total: '110.06',
            },
        ],
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
