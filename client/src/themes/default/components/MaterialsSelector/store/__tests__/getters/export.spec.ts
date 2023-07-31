import exportData from '../../getters/export';

import type { State } from '../../_types';

describe('MaterialsSelector / Store / export()', () => {
    const createState = (_materials: State['materials']): State => ({
        materials: _materials,
    });

    it('should return the store data, formatted', () => {
        const state = createState({
            '1': {
                quantity: 2,
            },
            '2': {
                quantity: 12,
            },
            '3': {
                quantity: 10,
            },
            '4': {
                quantity: 0,
            },
        });
        expect(exportData(state)()).toEqual([
            { id: 1, quantity: 2 },
            { id: 2, quantity: 12 },
            { id: 3, quantity: 10 },
        ]);
    });
});
