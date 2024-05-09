import omit from 'lodash/omit';
import categories from './categories';
import { AttributeType } from '@/stores/api/attributes';
import { dataFactory } from './@utils';

const data = [
    {
        id: 1,
        name: `Poids`,
        type: AttributeType.FLOAT,
        unit: 'kg',
        is_totalisable: true,
        categories: [
            categories.default(2),
            categories.default(1),
        ],
    },
    {
        id: 2,
        name: `Couleur`,
        type: AttributeType.STRING,
        max_length: null,
        categories: [],
    },
    {
        id: 3,
        name: `Puissance`,
        type: AttributeType.INTEGER,
        unit: 'W',
        is_totalisable: true,
        categories: [
            categories.default(2),
            categories.default(1),
        ],
    },
    {
        id: 4,
        name: `Conforme`,
        type: AttributeType.BOOLEAN,
        categories: [],
    },
    {
        id: 5,
        name: `Date d'achat`,
        type: AttributeType.DATE,
        categories: [],
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asDetails = dataFactory(data);

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data, (attribute) => (
    omit(attribute, ['categories'])
));

export default {
    default: asDefault,
    details: asDetails,
};
