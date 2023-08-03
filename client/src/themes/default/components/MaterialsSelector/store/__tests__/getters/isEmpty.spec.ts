import isEmpty from '../../getters/isEmpty';

import type { State } from '../../_types';

describe('MaterialsSelector / Store / isEmpty()', () => {
    const createState = (_materials: State['materials']): State => ({
        materials: _materials,
    });

    it('should return `false` if the store contains selected material', () => {
        // - State "simple".
        const state1 = createState({
            '1': {
                quantity: 0,
            },
            '2': {
                quantity: 0,
            },
            '3': {
                quantity: 1,
            },
        });
        expect(isEmpty(state1)).toBe(false);

        // - State "complet".
        const state2 = createState({
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
        expect(isEmpty(state2)).toBe(false);
    });

    it('should return `true` if the store does not contain selected material', () => {
        // - State complètement vide.
        const state1 = createState({});
        expect(isEmpty(state1)).toBe(true);

        // - State avec des quantités à 0.
        const state2 = createState({
            '1': {
                quantity: 0,
            },
            '2': {
                quantity: 0,
            },
        });
        expect(isEmpty(state2)).toBe(true);
    });
});
