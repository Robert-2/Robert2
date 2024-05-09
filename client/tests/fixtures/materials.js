import { dataFactory } from './@utils';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import attributes from './attributes';
import tags from './tags';

const data = [
    {
        id: 1,
        name: 'Console Yamaha CL3',
        reference: 'CL3',
        description: 'Console numérique 64 entrées / 8 sorties + Master + Sub',
        park_id: 1,
        category_id: 1,
        sub_category_id: 1,
        rental_price: 300,
        stock_quantity: 5,
        out_of_order_quantity: 1,
        available_quantity: 4,
        replacement_price: 19_400,
        is_hidden_on_bill: false,
        is_discountable: false,
        is_reservable: true,
        picture: 'http://loxya.test/materials/1/picture',
        note: null,
        attributes: [
            { ...attributes.default(1), value: 36.5 },
            { ...attributes.default(2), value: 'Grise' },
            { ...attributes.default(3), value: 850 },
        ],
        tags: [
            tags.default(1),
        ],
        created_at: '2021-02-12 23:00:00',
        updated_at: '2021-02-12 23:00:00',
    },
    {
        id: 2,
        name: 'Processeur DBX PA2',
        reference: 'DBXPA2',
        description: 'Système de diffusion numérique',
        park_id: 1,
        category_id: 1,
        sub_category_id: 2,
        rental_price: 25.5,
        stock_quantity: 2,
        out_of_order_quantity: 0,
        available_quantity: 2,
        replacement_price: 349.9,
        is_hidden_on_bill: false,
        is_discountable: true,
        is_reservable: false,
        picture: null,
        note: null,
        attributes: [
            { ...attributes.default(1), value: 2.2 },
            { ...attributes.default(3), value: 35 },
        ],
        tags: [
            tags.default(1),
        ],
        created_at: '2021-02-12 23:01:00',
        updated_at: '2021-02-12 23:02:00',
    },
    {
        id: 3,
        name: 'PAR64 LED',
        reference: 'PAR64LED',
        description: 'Projecteur PAR64 à LED, avec son set de gélatines',
        park_id: 1,
        category_id: 2,
        sub_category_id: 3,
        rental_price: 3.5,
        stock_quantity: 34,
        out_of_order_quantity: 4,
        available_quantity: 30,
        replacement_price: 89,
        is_hidden_on_bill: false,
        is_discountable: true,
        is_reservable: true,
        picture: null,
        note: 'Soyez délicats avec ces projos !',
        attributes: [
            { ...attributes.default(1), value: 0.85 },
            { ...attributes.default(3), value: 150 },
        ],
        tags: [
            tags.default(1),
        ],
        created_at: '2021-02-12 23:02:00',
        updated_at: '2021-02-12 23:02:00',
    },
    {
        id: 4,
        name: 'Showtec SDS-6',
        reference: 'SDS-6-01',
        description: `Console DMX (jeu d'orgue) Showtec 6 canaux`,
        park_id: 1,
        category_id: 2,
        sub_category_id: 4,
        rental_price: 15.95,
        stock_quantity: 2,
        out_of_order_quantity: 0,
        available_quantity: 2,
        replacement_price: 59,
        is_hidden_on_bill: false,
        is_discountable: true,
        is_reservable: true,
        picture: null,
        note: null,
        attributes: [
            { ...attributes.default(1), value: 3.15 },
            { ...attributes.default(3), value: 60 },
            { ...attributes.default(4), value: true },
        ],
        tags: [],
        created_at: '2021-02-12 23:03:00',
        updated_at: '2021-02-12 23:03:00',
    },
    {
        id: 5,
        name: 'Câble XLR 10m',
        reference: 'XLR10',
        description: 'Câble audio XLR 10 mètres, mâle-femelle',
        park_id: 1,
        category_id: 1,
        sub_category_id: null,
        rental_price: 0.5,
        stock_quantity: 40,
        out_of_order_quantity: 8,
        available_quantity: 32,
        replacement_price: 9.5,
        is_hidden_on_bill: true,
        is_discountable: true,
        is_reservable: true,
        picture: null,
        note: null,
        attributes: [],
        tags: [],
        created_at: '2021-02-12 23:14:00',
        updated_at: '2021-02-12 23:14:00',
    },
    {
        id: 6,
        name: 'Behringer X Air XR18',
        description: 'Mélangeur numérique 18 canaux',
        reference: 'XR18',
        park_id: 1,
        category_id: 1,
        sub_category_id: 1,
        rental_price: 49.99,
        stock_quantity: 3,
        out_of_order_quantity: 1,
        available_quantity: 2,
        replacement_price: 419,
        is_hidden_on_bill: false,
        is_discountable: false,
        is_reservable: true,
        picture: null,
        note: null,
        tags: [],
        attributes: [
            { ...attributes.default(5), value: '2021-01-28' },
        ],
        created_at: '2021-02-12 23:15:00',
        updated_at: '2021-02-12 23:15:00',
    },
    {
        id: 7,
        name: 'Volkswagen Transporter',
        description: 'Volume utile: 9.3 m3',
        reference: 'Transporter',
        park_id: 1,
        category_id: 3,
        sub_category_id: null,
        rental_price: 300,
        stock_quantity: 2,
        out_of_order_quantity: 0,
        available_quantity: 2,
        replacement_price: 32_000,
        is_hidden_on_bill: false,
        is_discountable: false,
        is_reservable: true,
        picture: null,
        note: null,
        tags: [],
        attributes: [],
        created_at: '2021-02-12 23:16:00',
        updated_at: '2021-02-12 23:16:00',
    },
    {
        id: 8,
        name: 'Décor Thème Forêt',
        description: 'Forêt mystique, typique des récits fantastiques.',
        reference: 'Decor-Forest',
        park_id: 1,
        category_id: 4,
        sub_category_id: null,
        rental_price: 1500,
        stock_quantity: 2,
        out_of_order_quantity: 0,
        available_quantity: 2,
        replacement_price: 8500,
        is_hidden_on_bill: false,
        is_discountable: true,
        is_reservable: true,
        picture: null,
        note: null,
        tags: [],
        attributes: [],
        created_at: '2021-02-12 23:18:00',
        updated_at: '2021-02-12 23:18:00',
    },
];

//
// - Exports
//

/** @type {import('./@utils').FactoryReturnType} */
const asDefault = dataFactory(data, (material) => (
    omit(material, ['available_quantity'])
));

/** @type {import('./@utils').FactoryReturnType} */
const withAvailability = dataFactory(data, (material) => material);

/** @type {import('./@utils').FactoryReturnType} */
const asDetails = dataFactory(data, (material) => (
    omit(material, ['available_quantity'])
));

/** @type {import('./@utils').FactoryReturnType} */
const asPublic = dataFactory(data, (material) => (
    pick(material, [
        'id',
        'name',
        'description',
        'picture',
        'available_quantity',
        'rental_price',
    ])
));

export default {
    default: asDefault,
    details: asDetails,
    public: asPublic,
    withAvailability,
};
