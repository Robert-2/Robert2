import materials from '@fixtures/parsed/materials';
import increment from '../../mutations/increment';

import type { State } from '../../_types';

describe('MaterialsSelector / Store / increment()', () => {
    const createState = (_materials: State['materials']): State => ({
        materials: _materials,
    });

    it('should add a new material with 1 quantity if not already in store', () => {
        const material = materials.withAvailability(2);
        const state = createState({
            '1': { quantity: 1 },
        });
        increment(state, { material });
        expect(state.materials).toEqual({
            '1': { quantity: 1 },
            '2': { quantity: 1 },
        });
    });

    it('should add 1 to an already existing material', () => {
        const material = materials.withAvailability(2);
        const state = createState({
            '1': { quantity: 1 },
            '2': { quantity: 1 },
        });
        increment(state, { material });
        expect(state.materials).toEqual({
            '1': { quantity: 1 },
            '2': { quantity: 2 },
        });
    });
});
