import events from '@fixtures/parsed/events';
import categories from '@fixtures/parsed/categories';
import groupByCategories, { SortBy } from '../groupByCategories';

describe('groupByCategories', () => {
    it('returns an empty array when there is no data', () => {
        const result = groupByCategories([], categories.default());
        expect(result).toEqual([]);
    });

    it('returns event materials grouped by categories', () => {
        const eventMaterials = events.details(3).materials;

        // - Triés par nom (défaut).
        const result1 = groupByCategories(eventMaterials, categories.default());
        expect(result1).toEqual([
            {
                id: 2,
                name: 'Lumière',
                materials: [
                    { ...eventMaterials[0] },
                ],
            },
            {
                id: 1,
                name: 'Son',
                materials: [
                    { ...eventMaterials[2] },
                    { ...eventMaterials[1] },
                ],
            },
        ]);

        // - Triés par prix.
        const result2 = groupByCategories(eventMaterials, categories.default(), SortBy.PRICE);
        expect(result2).toEqual([
            {
                id: 2,
                name: 'Lumière',
                materials: [
                    { ...eventMaterials[0] },
                ],
            },
            {
                id: 1,
                name: 'Son',
                materials: [
                    { ...eventMaterials[1] },
                    { ...eventMaterials[2] },
                ],
            },
        ]);
    });
});
