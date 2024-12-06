import { dataFactory } from './@utils';

const data = [
    {
        id: 1,
        number: '2020-00001',
        date: '2020-01-30 14:00:00',
        url: 'http://loxya.test/invoices/1/pdf',
        total_without_taxes: '544.13',
        total_taxes: [
            {
                name: 'T.V.A.',
                is_rate: true,
                value: '20.000',
                total: '108.82',
            },
        ],
        total_with_taxes: '652.96',
        currency: 'EUR',
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data);

export default { default: asDefault };
