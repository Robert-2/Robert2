import dispatchMaterialInSections from '@/utils/dispatchMaterialInSections';
import eventMaterials from './data/event-materials';
import eventReturnMaterials from './data/event-return-materials';
import materials from './data/materials';

const sectionNameGetter = (id) => {
    switch (id) {
        case 1:
            return 'Category C';
        case 2:
            return 'Category A';
        case 3:
            return 'Category B';
        default:
            return null;
    }
};

const sectionParkGetter = (id) => {
    switch (id) {
        case 1:
            return 'Park A';
        case 2:
            return 'Park B';
        default:
            return null;
    }
};

describe('dispatchMaterialInSections', () => {
    test('returns an empty array with empty values', () => {
        expect(dispatchMaterialInSections()).toEqual([]);
        expect(dispatchMaterialInSections(null)).toEqual([]);
        expect(dispatchMaterialInSections(null, null)).toEqual([]);
        expect(dispatchMaterialInSections(null, null, null)).toEqual([]);
        expect(dispatchMaterialInSections([], null, null)).toEqual([]);
        expect(dispatchMaterialInSections(null, null, sectionNameGetter)).toEqual([]);
        expect(dispatchMaterialInSections([], null, sectionNameGetter)).toEqual([]);
    });

    /**
     * Materials
     */

    test('dispatch a list of materials by parks, sorted by name', () => {
        const result = dispatchMaterialInSections(materials, 'park_id', sectionParkGetter);
        expect(result).toEqual([
            {
                id: 1,
                name: 'Park A',
                subTotal: 680,
                materials: [
                    {
                        id: 32,
                        category_id: 1,
                        name: 'Material A',
                        is_unitary: false,
                        park_id: 1,
                        stock_quantity: 1,
                        rental_price: 10,
                        replacement_price: 125,
                        is_discountable: true,
                        units: [],
                    },
                    {
                        id: 31,
                        category_id: 1,
                        name: 'Material B',
                        is_unitary: false,
                        park_id: 1,
                        stock_quantity: 2,
                        rental_price: 10,
                        replacement_price: 350,
                        is_discountable: true,
                        units: [],
                    },
                    {
                        id: 33,
                        category_id: 2,
                        name: 'Material D',
                        is_unitary: false,
                        park_id: 1,
                        stock_quantity: 112,
                        rental_price: 5,
                        replacement_price: 150,
                        is_discountable: true,
                        units: [],
                    },
                    {
                        id: 35,
                        category_id: 2,
                        name: 'Material E',
                        is_unitary: true,
                        park_id: null,
                        stock_quantity: 3,
                        rental_price: 45,
                        replacement_price: 650,
                        is_discountable: true,
                        units: [
                            { id: 1, reference: 'E1', park_id: 1, is_lost: false, is_broken: false },
                            { id: 3, reference: 'E3', park_id: 1, is_lost: false, is_broken: true },
                        ],
                    },
                ],
            },
            {
                id: 2,
                name: 'Park B',
                subTotal: 60,
                materials: [
                    {
                        id: 34,
                        category_id: 3,
                        name: 'Material C',
                        is_unitary: false,
                        park_id: 2,
                        stock_quantity: 1,
                        rental_price: 15,
                        replacement_price: 200,
                        is_discountable: false,
                        units: [],
                    },
                    {
                        id: 35,
                        category_id: 2,
                        name: 'Material E',
                        is_unitary: true,
                        park_id: null,
                        stock_quantity: 3,
                        rental_price: 45,
                        replacement_price: 650,
                        is_discountable: true,
                        units: [
                            { id: 2, reference: 'E2', park_id: 2, is_lost: false, is_broken: false },
                        ],
                    },
                ],
            },
        ]);
    });

    test('dispatch a list of materials by categories, sorted by price', () => {
        const result = dispatchMaterialInSections(materials, 'category_id', sectionNameGetter, 'price');
        expect(result).toEqual([
            {
                id: 2,
                name: 'Category A',
                subTotal: 695,
                materials: [
                    {
                        id: 33,
                        category_id: 2,
                        name: 'Material D',
                        is_unitary: false,
                        park_id: 1,
                        stock_quantity: 112,
                        rental_price: 5,
                        replacement_price: 150,
                        is_discountable: true,
                        units: [],
                    },
                    {
                        id: 35,
                        category_id: 2,
                        name: 'Material E',
                        is_unitary: true,
                        park_id: null,
                        stock_quantity: 3,
                        rental_price: 45,
                        replacement_price: 650,
                        is_discountable: true,
                        units: [
                            { id: 1, reference: 'E1', park_id: 1, is_lost: false, is_broken: false },
                            { id: 2, reference: 'E2', park_id: 2, is_lost: false, is_broken: false },
                            { id: 3, reference: 'E3', park_id: 1, is_lost: false, is_broken: true },
                        ],
                    },
                ],
            },
            {
                id: 3,
                name: 'Category B',
                subTotal: 15,
                materials: [
                    {
                        id: 34,
                        category_id: 3,
                        name: 'Material C',
                        is_unitary: false,
                        park_id: 2,
                        stock_quantity: 1,
                        rental_price: 15,
                        replacement_price: 200,
                        is_discountable: false,
                        units: [],
                    },
                ],
            },
            {
                id: 1,
                name: 'Category C',
                subTotal: 30,
                materials: [
                    {
                        id: 31,
                        category_id: 1,
                        name: 'Material B',
                        is_unitary: false,
                        park_id: 1,
                        stock_quantity: 2,
                        rental_price: 10,
                        replacement_price: 350,
                        is_discountable: true,
                        units: [],
                    },
                    {
                        id: 32,
                        category_id: 1,
                        name: 'Material A',
                        is_unitary: false,
                        park_id: 1,
                        stock_quantity: 1,
                        rental_price: 10,
                        replacement_price: 125,
                        is_discountable: true,
                        units: [],
                    },
                ],
            },
        ]);
    });

    /**
     * Event's materials
     */

    test('dispatch a list of event materials by parks, sorted by name', () => {
        const result = dispatchMaterialInSections(eventMaterials, 'park_id', sectionParkGetter);
        expect(result).toEqual([
            {
                id: 1,
                name: 'Park A',
                subTotal: 125,
                materials: [
                    {
                        id: 32,
                        category_id: 1,
                        name: 'Material A',
                        is_unitary: false,
                        park_id: 1,
                        stock_quantity: 1,
                        rental_price: 10,
                        replacement_price: 125,
                        is_discountable: true,
                        pivot: { quantity: 2 },
                        units: [],
                    },
                    {
                        id: 31,
                        category_id: 1,
                        name: 'Material B',
                        is_unitary: false,
                        park_id: 1,
                        stock_quantity: 2,
                        rental_price: 10,
                        replacement_price: 350,
                        is_discountable: true,
                        pivot: { quantity: 1 },
                        units: [],
                    },
                    {
                        id: 33,
                        category_id: 2,
                        name: 'Material D',
                        is_unitary: false,
                        park_id: 1,
                        stock_quantity: 112,
                        rental_price: 5,
                        replacement_price: 150,
                        is_discountable: true,
                        pivot: { quantity: 1 },
                        units: [],
                    },
                    {
                        id: 35,
                        category_id: 2,
                        name: 'Material E',
                        is_unitary: true,
                        park_id: null,
                        stock_quantity: 3,
                        rental_price: 45,
                        replacement_price: 650,
                        is_discountable: true,
                        pivot: { quantity: 2, units: [1, 3] },
                        units: [
                            { id: 1, reference: 'E1', park_id: 1, is_lost: false, is_broken: false },
                            { id: 3, reference: 'E3', park_id: 1, is_lost: false, is_broken: true },
                        ],
                    },
                ],
            },
            {
                id: 2,
                name: 'Park B',
                subTotal: 90,
                materials: [
                    {
                        id: 34,
                        category_id: 3,
                        name: 'Material C',
                        is_unitary: false,
                        park_id: 2,
                        stock_quantity: 1,
                        rental_price: 15,
                        replacement_price: 200,
                        is_discountable: false,
                        pivot: { quantity: 3 },
                        units: [],
                    },
                    {
                        id: 35,
                        category_id: 2,
                        name: 'Material E',
                        is_unitary: true,
                        park_id: null,
                        stock_quantity: 3,
                        rental_price: 45,
                        replacement_price: 650,
                        is_discountable: true,
                        pivot: { quantity: 1, units: [2] },
                        units: [
                            { id: 2, reference: 'E2', park_id: 2, is_lost: false, is_broken: false },
                        ],
                    },
                ],
            },
        ]);
    });

    test('dispatch a list of event materials by categories, sorted by price', () => {
        const result = dispatchMaterialInSections(
            eventMaterials,
            'category_id',
            sectionNameGetter,
            'price',
        );
        expect(result).toEqual([
            {
                id: 2,
                name: 'Category A',
                subTotal: 140,
                materials: [
                    {
                        id: 35,
                        category_id: 2,
                        name: 'Material E',
                        is_unitary: true,
                        park_id: null,
                        stock_quantity: 3,
                        rental_price: 45,
                        replacement_price: 650,
                        is_discountable: true,
                        pivot: { quantity: 3, units: [1, 2, 3] },
                        units: [
                            { id: 1, reference: 'E1', park_id: 1, is_lost: false, is_broken: false },
                            { id: 2, reference: 'E2', park_id: 2, is_lost: false, is_broken: false },
                            { id: 3, reference: 'E3', park_id: 1, is_lost: false, is_broken: true },
                        ],
                    },
                    {
                        id: 33,
                        category_id: 2,
                        name: 'Material D',
                        is_unitary: false,
                        park_id: 1,
                        stock_quantity: 112,
                        rental_price: 5,
                        replacement_price: 150,
                        is_discountable: true,
                        pivot: { quantity: 1 },
                        units: [],
                    },
                ],
            },
            {
                id: 3,
                name: 'Category B',
                subTotal: 45,
                materials: [
                    {
                        id: 34,
                        category_id: 3,
                        name: 'Material C',
                        is_unitary: false,
                        park_id: 2,
                        stock_quantity: 1,
                        rental_price: 15,
                        replacement_price: 200,
                        is_discountable: false,
                        pivot: { quantity: 3 },
                        units: [],
                    },
                ],
            },
            {
                id: 1,
                name: 'Category C',
                subTotal: 30,
                materials: [
                    {
                        id: 32,
                        category_id: 1,
                        name: 'Material A',
                        is_unitary: false,
                        park_id: 1,
                        stock_quantity: 1,
                        rental_price: 10,
                        replacement_price: 125,
                        is_discountable: true,
                        pivot: { quantity: 2 },
                        units: [],
                    },
                    {
                        id: 31,
                        category_id: 1,
                        name: 'Material B',
                        is_unitary: false,
                        park_id: 1,
                        stock_quantity: 2,
                        rental_price: 10,
                        replacement_price: 350,
                        is_discountable: true,
                        pivot: { quantity: 1 },
                        units: [],
                    },
                ],
            },
        ]);
    });

    /**
     * Event return's materials
     */

    test('dispatch a list of event return materials by parks, sorted by name', () => {
        const result = dispatchMaterialInSections(eventReturnMaterials, 'park_id', sectionParkGetter);
        expect(result).toEqual([
            {
                id: 1,
                name: 'Park A',
                subTotal: 50,
                materials: [
                    {
                        id: 33,
                        category_id: 2,
                        name: 'Material D',
                        is_unitary: false,
                        park_id: 1,
                        stock_quantity: 112,
                        rental_price: 5,
                        replacement_price: 150,
                        is_discountable: true,
                        pivot: { quantity: 1, units: [] },
                        awaited_units: [],
                        units: [],
                    },
                    {
                        id: 35,
                        category_id: 2,
                        name: 'Material E',
                        is_unitary: true,
                        park_id: null,
                        stock_quantity: 3,
                        rental_price: 45,
                        replacement_price: 650,
                        is_discountable: true,
                        pivot: { quantity: 1, units: [1] },
                        awaited_quantity: 1,
                        awaited_units: [
                            { id: 1, reference: 'E1', park_id: 1, is_lost: false, is_broken: false },
                        ],
                        units: [
                            { id: 1, reference: 'E1', park_id: 1, is_lost: false, is_broken: false },
                            { id: 2, reference: 'E2', park_id: 2, is_lost: false, is_broken: false },
                            { id: 3, reference: 'E3', park_id: 1, is_lost: false, is_broken: true },
                        ],
                    },
                ],
            },
            {
                id: 2,
                name: 'Park B',
                subTotal: 75,
                materials: [
                    {
                        id: 34,
                        category_id: 3,
                        name: 'Material C',
                        is_unitary: false,
                        park_id: 2,
                        stock_quantity: 1,
                        rental_price: 15,
                        replacement_price: 200,
                        is_discountable: false,
                        pivot: { quantity: 2, units: [] },
                        awaited_units: [],
                        units: [],
                    },
                    {
                        id: 35,
                        category_id: 2,
                        name: 'Material E',
                        is_unitary: true,
                        park_id: null,
                        stock_quantity: 3,
                        rental_price: 45,
                        replacement_price: 650,
                        is_discountable: true,
                        pivot: { quantity: 1, units: [2] },
                        awaited_quantity: 1,
                        awaited_units: [
                            { id: 2, reference: 'E2', park_id: 2, is_lost: false, is_broken: false },
                        ],
                        units: [
                            { id: 1, reference: 'E1', park_id: 1, is_lost: false, is_broken: false },
                            { id: 2, reference: 'E2', park_id: 2, is_lost: false, is_broken: false },
                            { id: 3, reference: 'E3', park_id: 1, is_lost: false, is_broken: true },
                        ],
                    },
                ],
            },
        ]);
    });
});
