import { dataFactory } from './@utils';

const data = [
    {
        id: 1,
        name: 'Régisseur',
        is_used: true,
    },
    {
        id: 2,
        name: 'Technicien plateau',
        is_used: true,
    },
    {
        id: 3,
        name: 'Ingénieur du son',
        is_used: true,
    },
    {
        id: 4,
        name: 'Installateur',
        is_used: true,
    },
    {
        id: 5,
        name: 'Intervenant extérieur',
        is_used: false,
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data);

export default { default: asDefault };
