import getQuantity from '../../getters/getQuantity';

import type { State } from '../../_types';

describe('MaterialsSelector / Store / getQuantity()', () => {
    const createState = (_materials: State['materials']): State => ({
        materials: _materials,
    });

    it('should return 0 for material that does not exist in store', () => {
        // - Avec un matériel inexistant.
        const state1 = createState({});
        expect(getQuantity(state1)(1)).toBe(0);
    });

    it('should return the quantity in store for an existing material', () => {
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
        });

        // - Avec un matériel sans liste.
        expect(getQuantity(state)(1)).toBe(2);
        expect(getQuantity(state)(2)).toBe(12);
    });
});
