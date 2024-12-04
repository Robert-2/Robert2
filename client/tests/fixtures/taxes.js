import { dataFactory } from './@utils';

const data = [
    {
        id: 1,
        name: `T.V.A.`,
        is_group: false,
        is_rate: true,
        is_used: true,
        value: '20.000',
    },
    {
        id: 2,
        name: `T.V.A.`,
        is_group: false,
        is_rate: true,
        is_used: false,
        value: '5.500',
    },
    {
        id: 3,
        name: `Taxe écologique`,
        is_group: false,
        is_rate: false,
        is_used: true,
        value: '1.000',
    },
    {
        id: 4,
        name: `Taxe meuble`,
        is_group: true,
        is_used: false,
        components: [
            {
                name: `T.V.A`,
                is_rate: true,
                value: '20.000',
            },
            {
                name: `Éco-participation`,
                is_rate: false,
                value: '2.000',
            },
        ],
    },
    {
        id: 5,
        name: `Taxe Québec (TPS + TVQ)`,
        is_group: true,
        is_used: true,
        components: [
            {
                name: `TPS`,
                is_rate: true,
                value: '5.000',
            },
            {
                name: `TVQ`,
                is_rate: true,
                value: '9.975',
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
