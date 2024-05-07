import { dataFactory } from './@utils';

const data = [
    {
        id: 1,
        name: 'User-manual.pdf',
        type: 'application/pdf',
        size: 24_681_233,
        url: 'http://loxya.test/documents/1',
        created_at: '2021-02-12 13:23:02',
    },
    {
        id: 2,
        name: 'warranty.pdf',
        type: 'application/pdf',
        size: 124_068,
        url: 'http://loxya.test/documents/2',
        created_at: '2021-02-12 13:25:02',
    },
    {
        id: 3,
        name: 'plan-de-salle.xls',
        type: 'application/vnd.ms-excel',
        size: 49_802,
        url: 'http://loxya.test/documents/3',
        created_at: '2023-05-01 15:15:20',
    },
    {
        id: 4,
        name: `Carte de l'étudiant.png`,
        type: 'image/x-png',
        size: 9397,
        url: 'http://loxya.test/documents/4',
        created_at: '2023-05-02 17:32:05',
    },
    {
        id: 5,
        name: 'bon_de_sortie.doc',
        type: 'application/msword',
        size: 10_014_149,
        url: 'http://loxya.test/documents/5',
        created_at: '2023-05-01 15:15:20',
    },
    {
        id: 6,
        name: 'emploi-du-temps.xls',
        type: 'application/vnd.ms-excel',
        size: 70_001,
        url: 'http://loxya.test/documents/6',
        created_at: '2023-05-01 15:15:20',
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data);

export default { default: asDefault };
