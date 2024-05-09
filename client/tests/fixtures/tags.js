import { dataFactory } from './@utils';

const data = [
    {
        id: 1,
        name: 'Premium',
    },
    {
        id: 2,
        name: 'Vintage',
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data);

export default { default: asDefault };
