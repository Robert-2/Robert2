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
                subTotal: 590,
                materials: [
                    {
                        id: 32,
                        category_id: 1,
                        name: 'Material A',
                        park_id: 1,
                        stock_quantity: 1,
                        rental_price: 10,
                        replacement_price: 125,
                        is_discountable: true,
                    },
                    {
                        id: 31,
                        category_id: 1,
                        name: 'Material B',
                        park_id: 1,
                        stock_quantity: 2,
                        rental_price: 10,
                        replacement_price: 350,
                        is_discountable: true,
                    },
                    {
                        id: 33,
                        category_id: 2,
                        name: 'Material D',
                        park_id: 1,
                        stock_quantity: 112,
                        rental_price: 5,
                        replacement_price: 150,
                        is_discountable: true,
                    },
                ],
            },
            {
                id: 2,
                name: 'Park B',
                subTotal: 15,
                materials: [
                    {
                        id: 34,
                        category_id: 3,
                        name: 'Material C',
                        park_id: 2,
                        stock_quantity: 1,
                        rental_price: 15,
                        replacement_price: 200,
                        is_discountable: false,
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
                subTotal: 560,
                materials: [
                    {
                        id: 33,
                        category_id: 2,
                        name: 'Material D',
                        park_id: 1,
                        stock_quantity: 112,
                        rental_price: 5,
                        replacement_price: 150,
                        is_discountable: true,
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
                        park_id: 2,
                        stock_quantity: 1,
                        rental_price: 15,
                        replacement_price: 200,
                        is_discountable: false,
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
                        park_id: 1,
                        stock_quantity: 2,
                        rental_price: 10,
                        replacement_price: 350,
                        is_discountable: true,
                    },
                    {
                        id: 32,
                        category_id: 1,
                        name: 'Material A',
                        park_id: 1,
                        stock_quantity: 1,
                        rental_price: 10,
                        replacement_price: 125,
                        is_discountable: true,
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
                subTotal: 35,
                materials: [
                    {
                        id: 32,
                        category_id: 1,
                        name: 'Material A',
                        park_id: 1,
                        stock_quantity: 1,
                        rental_price: 10,
                        replacement_price: 125,
                        is_discountable: true,
                        pivot: { quantity: 2 },
                    },
                    {
                        id: 31,
                        category_id: 1,
                        name: 'Material B',
                        park_id: 1,
                        stock_quantity: 2,
                        rental_price: 10,
                        replacement_price: 350,
                        is_discountable: true,
                        pivot: { quantity: 1 },
                    },
                    {
                        id: 33,
                        category_id: 2,
                        name: 'Material D',
                        park_id: 1,
                        stock_quantity: 112,
                        rental_price: 5,
                        replacement_price: 150,
                        is_discountable: true,
                        pivot: { quantity: 1 },
                    },
                ],
            },
            {
                id: 2,
                name: 'Park B',
                subTotal: 45,
                materials: [
                    {
                        id: 34,
                        category_id: 3,
                        name: 'Material C',
                        park_id: 2,
                        stock_quantity: 1,
                        rental_price: 15,
                        replacement_price: 200,
                        is_discountable: false,
                        pivot: { quantity: 3 },
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
                subTotal: 5,
                materials: [
                    {
                        id: 33,
                        category_id: 2,
                        name: 'Material D',
                        park_id: 1,
                        stock_quantity: 112,
                        rental_price: 5,
                        replacement_price: 150,
                        is_discountable: true,
                        pivot: { quantity: 1 },
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
                        park_id: 2,
                        stock_quantity: 1,
                        rental_price: 15,
                        replacement_price: 200,
                        is_discountable: false,
                        pivot: { quantity: 3 },
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
                        park_id: 1,
                        stock_quantity: 1,
                        rental_price: 10,
                        replacement_price: 125,
                        is_discountable: true,
                        pivot: { quantity: 2 },
                    },
                    {
                        id: 31,
                        category_id: 1,
                        name: 'Material B',
                        park_id: 1,
                        stock_quantity: 2,
                        rental_price: 10,
                        replacement_price: 350,
                        is_discountable: true,
                        pivot: { quantity: 1 },
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
                subTotal: 5,
                materials: [
                    {
                        id: 33,
                        category_id: 2,
                        name: 'Material D',
                        park_id: 1,
                        stock_quantity: 112,
                        rental_price: 5,
                        replacement_price: 150,
                        is_discountable: true,
                        pivot: { quantity: 1 },
                    },
                ],
            },
            {
                id: 2,
                name: 'Park B',
                subTotal: 30,
                materials: [
                    {
                        id: 34,
                        category_id: 3,
                        name: 'Material C',
                        park_id: 2,
                        stock_quantity: 1,
                        rental_price: 15,
                        replacement_price: 200,
                        is_discountable: false,
                        pivot: { quantity: 2 },
                    },
                ],
            },
        ]);
    });
});
