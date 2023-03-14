import { groupByCategories } from '../_utils';
import materials from '@fixtures/materials';

describe('Inventory Utils', () => {
    describe('groupByCategories()', () => {
        const categories = [
            { id: 1, name: 'Category C' },
            { id: 2, name: 'Category A' },
            { id: 3, name: 'Category B' },
        ];

        test('Returns an empty array with empty values', () => {
            expect(groupByCategories([], categories)).toEqual([]);
        });

        test('Dispatch a list of event materials by categories', () => {
            const result = groupByCategories(materials, categories);
            expect(result).toEqual([
                {
                    id: 2,
                    name: 'Category A',
                    materials: [
                        materials[2],
                        materials[4],
                    ],
                },
                {
                    id: 3,
                    name: 'Category B',
                    materials: [
                        materials[3],
                    ],
                },
                {
                    id: 1,
                    name: 'Category C',
                    materials: [
                        materials[1],
                        materials[0],
                    ],
                },
            ]);
        });
    });

    // describe('groupByParks()', () => {
    //     const parks = [
    //         { id: 1, name: 'Park A' },
    //         { id: 2, name: 'Park B' },
    //     ];

    //     test('Returns an empty array with empty values', () => {
    //         expect(groupByParks([], parks)).toEqual([]);
    //     });

    //     test('Dispatch a list of materials by parks', () => {
    //         const result = groupByParks(materials, parks);
    //         expect(result).toEqual([
    //             {
    //                 id: 1,
    //                 name: 'Park A',
    //                 materials: [
    //                     { ...materials[1] },
    //                     { ...materials[0] },
    //                     { ...materials[2] },
    //                     { ...materials[4] },
    //                 ],
    //             },
    //             {
    //                 id: 2,
    //                 name: 'Park B',
    //                 materials: [
    //                     { ...materials[3] },
    //                     { ...materials[4] },
    //                 ],
    //             },
    //         ]);
    //     });
    // });
});
