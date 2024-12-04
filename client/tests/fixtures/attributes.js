import omit from 'lodash/omit';
import categories from './categories';
import { AttributeEntity, AttributeType } from '@/stores/api/attributes';
import { dataFactory } from './@utils';

const data = [
    {
        id: 1,
        name: `Poids`,
        entities: [AttributeEntity.MATERIAL],
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
        entities: [
            AttributeEntity.MATERIAL,
        ],
        type: AttributeType.STRING,
        max_length: null,
        categories: [],
    },
    {
        id: 3,
        name: `Puissance`,
        entities: [AttributeEntity.MATERIAL],
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
        entities: [AttributeEntity.MATERIAL],
        type: AttributeType.BOOLEAN,
        categories: [],
    },
    {
        id: 5,
        name: `Date d'achat`,
        entities: [
            AttributeEntity.MATERIAL,
            AttributeEntity.MATERIAL,
        ],
        type: AttributeType.DATE,
        categories: [],
    },
    {
        id: 6,
        name: `Nettoyé le`,
        entities: [AttributeEntity.MATERIAL],
        type: AttributeType.DATE,
        categories: [
            categories.default(3),
            categories.default(4),
        ],
    },
    {
        id: 7,
        name: `Immatriculation`,
        entities: [AttributeEntity.MATERIAL],
        type: AttributeType.STRING,
        max_length: null,
        categories: [
            categories.default(3),
        ],
    },
    {
        id: 8,
        name: `Prix d'achat`,
        entities: [
            AttributeEntity.MATERIAL,
        ],
        type: AttributeType.FLOAT,
        unit: '€',
        is_totalisable: true,
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
