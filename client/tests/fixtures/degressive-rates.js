import { dataFactory } from './@utils';

const data = [
    {
        id: 1,
        name: `Base`,
        is_used: true,
        tiers: [
            {
                from_day: 1,
                is_rate: false,
                value: '1.00',
            },
            {
                from_day: 2,
                is_rate: false,
                value: '1.75',
            },
            {
                from_day: 3,
                is_rate: false,
                value: '2.50',
            },
            {
                from_day: 4,
                is_rate: false,
                value: '3.25',
            },
            {
                from_day: 5,
                is_rate: false,
                value: '4.00',
            },
            {
                from_day: 6,
                is_rate: true,
                value: '75.42',
            },
        ],
    },
    {
        id: 2,
        name: `Transport`,
        is_used: true,
        tiers: [
            {
                from_day: 1,
                is_rate: true,
                value: '100',
            },
            {
                from_day: 2,
                is_rate: true,
                value: '75.00',
            },
        ],
    },
    {
        id: 3,
        name: `Fixe`,
        is_used: true,
        tiers: [
            {
                from_day: 1,
                is_rate: false,
                value: '1.00',
            },
        ],
    },
    {
        id: 4,
        name: `100%`,
        is_used: false,
        tiers: [
            {
                from_day: 1,
                is_rate: true,
                value: '100',
            },
        ],
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data);

export default { default: asDefault };
