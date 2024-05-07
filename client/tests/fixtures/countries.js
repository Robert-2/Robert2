import { dataFactory } from './@utils';

const data = [
    {
        id: 1,
        name: 'France',
        code: 'FR',
    },
    {
        id: 2,
        name: 'Suisse',
        code: 'CH',
    },
    {
        id: 3,
        name: 'Belgique',
        code: 'BE',
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data);

export default { default: asDefault };
