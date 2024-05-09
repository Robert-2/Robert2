import omit from 'lodash/omit';
import { dataFactory } from './@utils';
import subCategories from './subcategories';

const data = [
    {
        id: 1,
        name: 'Son',
        sub_categories: [
            subCategories.default(1),
            subCategories.default(2),
        ],
    },
    {
        id: 2,
        name: 'Lumière',
        sub_categories: [
            subCategories.default(4),
            subCategories.default(3),
        ],
    },
    {
        id: 3,
        name: 'Transport',
        sub_categories: [],
    },
    {
        id: 4,
        name: 'Décors',
        sub_categories: [],
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asDetails = dataFactory(data);

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data, (category) => (
    omit(category, ['sub_categories'])
));

export default {
    default: asDefault,
    details: asDetails,
};
