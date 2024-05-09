import { groupByCategories } from '../_utils';
import categories from '@fixtures/parsed/categories';
import materials from '@fixtures/parsed/materials';

describe('Inventory Utils', () => {
    describe('groupByCategories()', () => {
        test('Returns an empty array with empty values', () => {
            expect(groupByCategories([], categories.default())).toEqual([]);
        });

        test('Dispatch a list of event materials by categories', () => {
            const result = groupByCategories(materials.default(), categories.default());
            expect(result).toStrictEqual([
                {
                    id: 4,
                    name: 'Décors',
                    materials: [
                        materials.default(8),
                    ],
                },
                {
                    id: 2,
                    name: 'Lumière',
                    materials: [
                        materials.default(3),
                        materials.default(4),
                    ],
                },
                {
                    id: 1,
                    name: 'Son',
                    materials: [
                        materials.default(6),
                        materials.default(5),
                        materials.default(1),
                        materials.default(2),
                    ],
                },
                {
                    id: 3,
                    name: 'Transport',
                    materials: [
                        materials.default(7),
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
    //                     {
    //                         ...materials[4],
    //                         units: [
    //                             { ...materials[4].units[0] },
    //                             { ...materials[4].units[2] },
    //                         ],
    //                     },
    //                 ],
    //             },
    //             {
    //                 id: 2,
    //                 name: 'Park B',
    //                 materials: [
    //                     { ...materials[3] },
    //                     {
    //                         ...materials[4],
    //                         units: [
    //                             { ...materials[4].units[1] },
    //                         ],
    //                     },
    //                 ],
    //             },
    //         ]);
    //     });
    // });
});
