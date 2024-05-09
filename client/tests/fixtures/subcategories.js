import { dataFactory } from './@utils';

const data = [
    {
        id: 1,
        name: 'Mixeurs',
        category_id: 1,
    },
    {
        id: 2,
        name: 'Processeurs',
        category_id: 1,
    },
    {
        id: 3,
        name: 'Projecteurs',
        category_id: 2,
    },
    {
        id: 4,
        name: 'Gradateurs',
        category_id: 2,
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data);

export default { default: asDefault };
