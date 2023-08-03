import init from '../../mutations/init';

import type { State } from '../../_types';

describe('MaterialsSelector / Store / init()', () => {
    const createState = (_materials: State['materials']): State => ({
        materials: _materials,
    });

    it('should initialize the store with the specified quantities', () => {
        const state = createState({});
        init(state, [
            { id: 1, quantity: 1 },
            { id: 2, quantity: 2 },
            {
                id: 3,
                quantity: 2,
            },
        ]);
        expect(state.materials).toEqual({
            '1': { quantity: 1 },
            '2': { quantity: 2 },
            '3': {
                quantity: 2,
            },
        });
    });

    it('should remove the empty quantities', () => {
        const state = createState({});
        init(state, [
            { id: 1, quantity: 0 },
            {
                id: 2,
                quantity: 1,
            },
        ]);
        expect(state.materials).toEqual({
            '2': {
                quantity: 1,
            },
        });
    });
});
