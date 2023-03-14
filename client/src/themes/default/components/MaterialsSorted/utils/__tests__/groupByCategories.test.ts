import eventMaterials from '@fixtures/event-materials';
import groupByCategories from '../groupByCategories';

import type { Category } from '@/stores/api/categories';

const CATEGORIES: Category[] = [
    { id: 1, name: 'Category C' },
    { id: 2, name: 'Category A' },
    { id: 3, name: 'Category B' },
];

describe('groupByCategories', () => {
    it('returns an empty array when there is no data', () => {
        const result = groupByCategories([], CATEGORIES);
        expect(result).toEqual([]);
    });

    it('returns event materials grouped by categories', () => {
        const result = groupByCategories(eventMaterials, CATEGORIES);
        expect(result).toEqual([
            {
                id: 2,
                name: 'Category A',
                materials: [
                    { ...eventMaterials[2] },
                    { ...eventMaterials[4] },
                ],
            },
            {
                id: 3,
                name: 'Category B',
                materials: [
                    { ...eventMaterials[3] },
                ],
            },
            {
                id: 1,
                name: 'Category C',
                materials: [
                    { ...eventMaterials[1] },
                    { ...eventMaterials[0] },
                ],
            },
        ]);
    });
});
