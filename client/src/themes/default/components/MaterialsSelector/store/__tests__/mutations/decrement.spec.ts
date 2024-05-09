import materials from '@fixtures/parsed/materials';
import decrement from '../../mutations/decrement';

import type { State } from '../../_types';

describe('MaterialsSelector / Store / decrement()', () => {
    const createState = (_materials: State['materials']): State => ({
        materials: _materials,
    });

    it('should do nothing if the material does not exist in store', () => {
        const material = materials.withAvailability(2);

        // - Si le matériel n'existe pas dans le store.
        const state1 = createState({
            '1': { quantity: 1 },
        });
        decrement(state1, { material });
        expect(state1.materials).toEqual({
            '1': { quantity: 1 },
        });

        // - Si le matériel est déjà à `0` dans le store.
        const state2 = createState({
            '2': { quantity: 0 },
        });
        decrement(state2, { material });
        expect(state2.materials).toEqual({
            '2': { quantity: 0 },
        });
    });

    it('should remove 1 quantity to existing material', () => {
        const material = materials.withAvailability(2);

        // - Avec un matériel avec plusieurs quantités.
        const state = createState({
            '1': { quantity: 1 },
            '2': { quantity: 2 },
        });
        decrement(state, { material });
        expect(state.materials).toEqual({
            '1': { quantity: 1 },
            '2': { quantity: 1 },
        });

        // - Avec un matériel qui n'a qu'une quantité.
        decrement(state, { material });
        expect(state.materials).toEqual({
            '1': { quantity: 1 },
            '2': { quantity: 0 },
        });
    });
});
