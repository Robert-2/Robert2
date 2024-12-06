import events from '@fixtures/parsed/events';
import categories from '@fixtures/parsed/categories';
import groupByCategories, { SortBy } from '../groupByCategories';

describe('groupByCategories', () => {
    it('returns an empty array when there is no data', () => {
        const result = groupByCategories([], categories.default());
        expect(result).toEqual([]);
    });

    it('returns event materials grouped by categories', () => {
        // - Triés par nom (défaut).
        const event3Materials = events.details(3).materials;
        const result1 = groupByCategories(event3Materials, categories.default());
        expect(result1).toEqual([
            {
                id: 2,
                name: 'Lumière',
                materials: [
                    { ...event3Materials[0] },
                    { ...event3Materials[1] },
                ],
            },
            {
                id: 1,
                name: 'Son',
                materials: [
                    { ...event3Materials[2] },
                ],
            },
        ]);

        // - Triés par prix.
        const event1Materials = events.details(1).materials;
        const result2 = groupByCategories(event1Materials, categories.default(), SortBy.PRICE);
        expect(result2).toEqual([
            {
                id: 2,
                name: 'Lumière',
                materials: [
                    { ...event1Materials[2] },
                ],
            },
            {
                id: 1,
                name: 'Son',
                materials: [
                    { ...event1Materials[0] },
                    { ...event1Materials[1] },
                ],
            },
        ]);
    });
});
